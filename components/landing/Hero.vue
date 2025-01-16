<template>
  <main class="grid lg:grid-cols-2 place-items-center md:pt-8">
    <div class="p-24 pr-0 md:order-1 hidden md:block">
      <img src="~/assets/img/66223e8f2ba9f44ca225e900_faq.svg" alt="WebRay" loading="eager" format="avif" width="512"
        height="512" />
    </div>

    <div>
      <h1 class="text-5xl lg:text-6xl xl:text-7xl font-bold lg:tracking-tight">
        X-ray für deine <span class="text-secondaryc">Website.</span>
      </h1>
      <!-- Domain input and query button -->
      <div class="mt-10 mr-5">
        <div class="flex flex-row gap-3">
          <div class="flex-1">
            <UInput size="xl" icon="i-heroicons-magnifying-glass-20-solid" color="primary" variant="outline"
              placeholder="z.B. google.at" v-model="domainInput" :loading="loading" @keydown.enter="sendDomain" />
          </div>
          <UButton :disabled="!isValidDomain || loading" @click="sendDomain"> {{ loading ? "Lädt..." : "Suchen" }}
          </UButton>
        </div>
      </div>

      <!-- Anzeige des Verbindungsstatus -->
      <div class="mt-10 text-xl">
        <p v-if="errorMessage" class="text-red-500">Fehler: {{ errorMessage }}</p>
        <h1 v-if="loading" class="mt-5 text-bold">Der Scan kann bis zu 5min in Anspruch nehmen... ⏲️</h1>
      </div>
    </div>
  </main>
  <div v-if="parsedData" ref="resultContainer" class="mt-72">
    <h1 class="text-4xl lg:text-5xl font-bold lg:tracking-tight text-primaryc">
      Sicherheitsüberprüfung der Website
    </h1>
    <p class="text-xl mt-5">
      Basierend auf den neuesten Sicherheits-Scans wurden die folgenden Ergebnisse ermittelt:
    </p>

    <!-- Dynamische Anzeige des Sicherheits-Scores und der Status-Zusammenfassung -->
    <div v-if="parsedData" class="mt-9">
      <h2 class="text-2xl font-semibold">Sicherheits-Score: <span class="text-3xl text-secondaryc">{{
        parsedData.sicherheits_score }}</span></h2>
      <p class="text-slate-601 mt-2">{{ parsedData.status_zusammenfassung }}</p>
    </div>

    <!-- Dynamische Anzeige der Findings -->
    <div class="grid sm:grid-cols-2 md:grid-cols-1 mt-8 gap-8"
      v-if="parsedData?.befunde && parsedData.befunde.length > 0">
      <div v-for="item in parsedData.befunde" :key="item.id"
        class="flex gap-5 items-start p-4 border border-primaryc rounded-lg shadow-sm">
        <!-- Severity Icon -->
        <div class="mt-2 bg-primaryc rounded-full p-2 w-8 h-8 shrink-0">
          <Icon class="text-white" :name="getSeverityIcon(item.schwere)" />
        </div>

        <!-- Finding details -->
        <div>
          <h2 class="font-semibold text-lg">ID: {{ item.id }}</h2>
          <p class="text-slate-501 mt-2 leading-relaxed">
            <strong>Schwere:</strong> {{ item.schwere }}
          </p>
          <p class="text-slate-501 mt-2 leading-relaxed">
            <strong>Beschreibung:</strong> {{ item.beschreibung }}
          </p>
        </div>
      </div>
    </div>
  </div>


  <!-- Button Back to Top -->
  <div v-if="showBackToTop" class="fixed bottom-10 right-10">
    <UButton icon="i-heroicons-chevron-double-up" size="sm" color="primary" variant="solid" label="Nach oben"
      :trailing="false" @click="scrollToTop" />
  </div>

</template>

<script setup lang="ts">
import { createWebSocket } from "~/components/socket";
import { ref } from "vue";
import { nextTick } from "vue";

const isConnected = ref(false); // Status der Verbindung
const lastMessage = ref(""); // Zuletzt empfangene Nachricht
const domainInput = ref(""); // Eingabefeld für die Domain
const resultContainer = ref(null); // Referenz auf den Container
const isValidDomain = ref(true); // Überprüfung der Domain
const parsedData = ref<any>(null); // Verarbeitete JSON-Daten
const loading = ref(false); // Ladezustand
const errorMessage = ref(""); // Fehlermeldung
const showBackToTop = ref(false);
let socket: WebSocket;

// Helper function to determine the severity icon based on severity level
const getSeverityIcon = (severity) => {
  if (severity === 'Hoch') {
    return 'bx:bxs-error'; // Example icon for high severity
  } else if (severity === 'Niedrig') {
    return 'bx:bxs-info-circle'; // Example icon for low severity
  }
  return 'bx:bxs-help-circle'; // Default icon if severity is undefined
};

// Event-Handler für das Scrollen
const handleScroll = () => {
  const scrollPosition = window.scrollY; // Aktuelle Scroll-Position
  const halfPage = document.documentElement.scrollHeight / 3; // Hälfte der gesamten Seite
  showBackToTop.value = scrollPosition > halfPage; // Button nur anzeigen, wenn die Hälfte erreicht ist
};

// Scroll nach oben Funktion
const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};


// RegEx für die Domain-Validierung
const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z0-9]{2,})$/i;


onMounted(() => {
  window.addEventListener("scroll", handleScroll); // Listener fürs Scrollen aktivieren
  socket = createWebSocket();

  // Status: Verbindung geöffnet
  socket.addEventListener("open", () => {
    isConnected.value = true;
  });

  // Nachricht empfangen
  socket.addEventListener("message", async (event) => {
    loading.value = false;
    domainInput.value = "";

    errorMessage.value = ""; // Fehler zurücksetzen
    lastMessage.value = event.data;


    // Versuche, die empfangene Nachricht als JSON zu parsen
    try {
      parsedData.value = JSON.parse(event.data);

      // Warte, bis das DOM aktualisiert wurde
      await nextTick();
      // Scroll zu dem Container mit den Ergebnissen
      if (resultContainer.value) {
        resultContainer.value.scrollIntoView({ behavior: "smooth", block: "center" });
      }

    } catch (error) {
      errorMessage.value = "Fehler beim Verarbeiten der empfangenen Daten.";
    }

  });

  // Verbindung geschlossen
  socket.addEventListener("close", () => {
    // Automatisch wieder verbinden
    setTimeout(() => {
      if (!isConnected.value) {
        socket = createWebSocket();
      }
    }, 3000);
  });

  // Fehler behandeln
  socket.addEventListener("error", (error) => {
    console.error("[WebSocket] Fehler:", error);
    loading.value = false;
    errorMessage.value = "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut."
    isConnected.value = false;
  });
});


// Überprüfe die Domain mit dem RegEx
const validateDomain = (domain: string): boolean => {
  return domainRegex.test(domain);
};

const sendDomain = () => {
  if (domainInput.value) {
    loading.value = true;
    errorMessage.value = ""; //Vorherigen Fehler zurücksetzen

    // Sende Domain über den WebSocket an den Server
    socket.send(JSON.stringify({ domain: domainInput.value }));
  } else {
    console.error("Bitte eine Domain eingeben.");
  }
};

// Überprüfung der Domain bei jeder Eingabe
watch(domainInput, (newDomain) => {
  isValidDomain.value = validateDomain(newDomain);
});

onUnmounted(() => {
  console.log("Hero.vue: Schließe WebSocket...");
  window.removeEventListener("scroll", handleScroll);
  socket.close();
});
</script>
