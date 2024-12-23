<template>
  <main class="grid lg:grid-cols-2 place-items-center pb-64 md:pt-8">
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
              placeholder="z.B. google.at" v-model="domainInput" :loading="loading" />
          </div>
          <UButton :disabled="!isValidDomain || loading" @click="sendDomain"> {{ loading ? "Lädt..." : "Suchen" }}
          </UButton>
        </div>
      </div>

      <!-- Anzeige des Verbindungsstatus -->
      <div class="mt-10 text-xl">
        <p>Status: {{ isConnected ? 'verbunden' : 'getrennt' }}</p>
        <p v-if="errorMessage" class="text-red-500">Fehler: {{ errorMessage }}</p>
      </div>
    </div>
  </main>
  <div v-if="parsedData" class="mt-17 md:mt-0 mb-72">
    <h1 class="text-4xl lg:text-5xl font-bold lg:tracking-tight">
      Sicherheitsüberprüfung der Website
    </h1>
    <p class="text-lg mt-5 text-slate-600">
      Basierend auf den neuesten Sicherheits-Scans wurden die folgenden Ergebnisse ermittelt:
    </p>

    <!-- Dynamische Anzeige des Sicherheits-Scores und der Status-Zusammenfassung -->
    <div v-if="parsedData" class="mt-9">
      <h2 class="text-2xl font-semibold">Sicherheits-Score: {{ parsedData.sicherheits_score }}</h2>
      <p class="text-slate-601 mt-2">{{ parsedData.status_zusammenfassung }}</p>
    </div>

    <!-- Dynamische Anzeige der Findings -->
    <div class="grid sm:grid-cols-2 md:grid-cols-1 mt-8 gap-8"
      v-if="parsedData?.befunde && parsedData.befunde.length > 0">
      <div v-for="item in parsedData.befunde" :key="item.id"
        class="flex gap-5 items-start p-4 border border-gray-200 rounded-lg shadow-sm">
        <!-- Severity Icon -->
        <div class="mt-2 bg-black rounded-full p-2 w-8 h-8 shrink-0">
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
</template>

<script setup lang="ts">
import { createWebSocket } from "~/components/socket";
import { ref } from "vue";

const isConnected = ref(false); // Status der Verbindung
const lastMessage = ref(""); // Zuletzt empfangene Nachricht
const domainInput = ref(""); // Eingabefeld für die Domain
const isValidDomain = ref(true); // Überprüfung der Domain
const parsedData = ref<any>(null); // Verarbeitete JSON-Daten
const loading = ref(false); // Ladezustand
const errorMessage = ref(""); // Fehlermeldung
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


// RegEx für die Domain-Validierung
const domainRegex = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:[a-z0-9]{2,})$/i;


onMounted(() => {
  console.log("Hero.vue: Verbindung wird hergestellt...");
  socket = createWebSocket();

  // Status: Verbindung geöffnet
  socket.addEventListener("open", () => {
    console.log("[WebSocket] Verbindung hergestellt");
    isConnected.value = true;
  });

  // Nachricht empfangen
  socket.addEventListener("message", (event) => {
    console.log("[WebSocket] Nachricht empfangen:", event.data);
    loading.value = false;
    errorMessage.value = ""; // Fehler zurücksetzen
    lastMessage.value = event.data;

    // Versuche, die empfangene Nachricht als JSON zu parsen
    try {
      parsedData.value = JSON.parse(event.data);
    } catch (error) {
      errorMessage.value = "Fehler beim Verarbeiten der empfangenen Daten.";
    }

  });

  // Verbindung geschlossen
  socket.addEventListener("close", () => {
    console.log("[WebSocket] Verbindung geschlossen");
    isConnected.value = false;
    // Automatisch wieder verbinden
    setTimeout(() => {
      if (!isConnected.value) {
        console.log("[WebSocket] Versuche, die Verbindung wiederherzustellen...");
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
    console.log(`[WebSocket] Nachricht gesendet: { domain: ${domainInput.value} }`);
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
  socket.close();
});
</script>
