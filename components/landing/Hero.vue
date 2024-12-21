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
              placeholder="z.B. google.at" v-model="domainInput" />
          </div>
          <UButton :disabled="!isValidDomain" @click="sendDomain">Suchen</UButton>
        </div>
      </div>

      <!-- Anzeige des Verbindungsstatus -->
      <div class="mt-10 text-xl">
        <p>Status: {{ isConnected ? 'verbunden' : 'getrennt' }}</p>
        <p>Zuletzt empfangene Nachricht: {{ lastMessage || 'Keine Nachricht empfangen' }}</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { createWebSocket } from "~/components/socket";
import { ref } from "vue";

const isConnected = ref(false); // Status der Verbindung
const lastMessage = ref(""); // Zuletzt empfangene Nachricht
const domainInput = ref(""); // Eingabefeld für die Domain
const isValidDomain = ref(true); // Überprüfung der Domain
let socket: WebSocket;


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
    lastMessage.value = event.data;
  });

  // Verbindung geschlossen
  socket.addEventListener("close", () => {
    console.log("[WebSocket] Verbindung geschlossen");
    isConnected.value = false;
  });

  // Fehler behandeln
  socket.addEventListener("error", (error) => {
    console.error("[WebSocket] Fehler:", error);
    isConnected.value = false;
  });
});

// Überprüfe die Domain mit dem RegEx
const validateDomain = (domain: string): boolean => {
  return domainRegex.test(domain);
};

const sendDomain = () => {
  if (domainInput.value) {
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
