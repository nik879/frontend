<template>
  <main class="grid lg:grid-cols-2 place-items-center md:pt-8">
    <div class="p-24 pr-0 md:order-1 hidden md:block">
      <img src="~/assets/img/66223e8f2ba9f44ca225e900_faq.svg" alt="WebRay" loading="eager" format="avif" width="512"
        height="512" />
    </div>

    <div>
      <h1 class="text-5xl lg:text-6xl xl:text-7xl font-bold lg:tracking-tight">
        X-ray for your <span class="text-secondaryc">Webpage.</span>
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
        <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
        <h1 v-if="loading" class="mt-5 text-bold">The scan takes a few minutes... ⏲️</h1>
      </div>
    </div>
  </main>
  <div v-if="parsedData && !loading" ref="resultContainer" class="mt-10">
    <h1 class="text-4xl lg:text-5xl font-bold lg:tracking-tight">
      Check of <span class="text-secondaryc">{{ parsedData.metadata.domain }}</span>
    </h1>
    <p class="text-xl mt-5">
      Based on our scan these are the results for your webpage.
    </p>

    <!-- Dynamische Anzeige des Sicherheits-Scores und der Status-Zusammenfassung -->
    <div v-if="parsedData.metadata.summary" class="mt-9">
      <h2 class="text-3xl font-semibold">Security Score: <span class="text-5xl text-secondaryc">{{
        parsedData.metadata.total_rating }}</span></h2>
    </div>

    <!-- Dynamische Anzeige der Findings -->
    <div class="grid sm:grid-cols-2 md:grid-cols-1 mt-8 gap-8"
      v-if="parsedData.findings && parsedData.findings.length > 0">
      <div v-for="item in parsedData.findings" :key="item.category"
        class="flex gap-5 items-start p-4 border border-primaryc rounded-lg shadow-sm">

        <!-- Severity Icon -->
        <div class="mt-2 bg-primaryc rounded-full p-2 w-8 h-8 shrink-0">
          <Icon class="text-white" :name="getSeverityIcon(item.risk_rating)" />
        </div>

        <!-- Finding details -->
        <div>
          <h2 class="font-semibold text-lg">{{ item.category }}</h2>
          <p class="text-slate-501 mt-2 leading-relaxed">
            <strong>Description:</strong> {{ item.description }}
          </p>
          <p class="text-slate-501 mt-2 leading-relaxed">
            <strong>Rating:</strong> {{ item.risk_rating }}
          </p>
          <p class="text-slate-501 mt-2 leading-relaxed">
            <strong>Reason:</strong> {{ item.justification }}
          </p>
          <p class="text-slate-501 mt-2 leading-relaxed">
            <strong>Recommendation:</strong> {{ item.recommendation }}
          </p>
          <p class="text-slate-501 mt-2 leading-relaxed" v-if="item.data && Object.keys(item.data).length > 0">
            <strong>Aux:</strong> {{ item.data }}
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
  if (severity === 'Critical') {
    return 'bx:bx-error-alt'; // Icon for critical severity
  } else if (severity === 'High') {
    return 'bx:bx-error'; // Icon for high severity
  } else if (severity === 'Medium') {
    return 'bx:bxs-capsule'; // Icon for medium severity
  } else if (severity === 'Low') {
    return 'bx:bx-bug'; // Icon for low severity
  } else if (severity === 'Informational') {
    return 'bx:bxs-info-circle'; // Icon for informational severity
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

// Define the severity order for sorting
const severityOrder = {
  Critical: 1,
  High: 2,
  Medium: 3,
  Low: 4,
  Informational: 5
};

// Function to sort findings based on severity
const sortFindingsBySeverity = (findings) => {
  return findings.sort((a, b) => {
    const severityA = a.risk_rating;
    const severityB = b.risk_rating;

    // Compare the severity levels based on the defined order
    return severityOrder[severityA] - severityOrder[severityB];
  });
};


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
      parsedData.value.findings = sortFindingsBySeverity(parsedData.value.findings);


      // Warte, bis das DOM aktualisiert wurde
      await nextTick();
      // Scroll zu dem Container mit den Ergebnissen
      if (resultContainer.value) {
        resultContainer.value.scrollIntoView({ behavior: "smooth", block: "start" });
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
