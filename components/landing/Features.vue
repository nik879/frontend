<script setup lang="ts">

// Helper function to determine the severity icon based on severity level
const getSeverityIcon = (severity) => {
  if (severity === 'Hoch') {
    return 'bx:bxs-error'; // Example icon for high severity
  } else if (severity === 'Niedrig') {
    return 'bx:bxs-info-circle'; // Example icon for low severity
  }
  return 'bx:bxs-help-circle'; // Default icon if severity is undefined
};

// Beispiel JSON-Daten
const jsonData = ref({
  sicherheits_score: 75,
  status_zusammenfassung: "Fehlende HTTP-Sicherheitsheader stellen ein erhebliches Risiko dar.",
  befunde: [
    {
      id: "FND001",
      schwere: "Hoch",
      beschreibung: "Fehlende HTTP-Sicherheitsheader, einschließlich xFrameOptions, xContentTypeOptions, xXSSProtection, contentSecurityPolicy, referrerPolicy und permissionsPolicy, erhöhen das Risiko von Angriffen.",
    },
    {
      id: "FND002",
      schwere: "Niedrig",
      beschreibung: "SMTP-Sicherheit durch die Verwendung von SPF und Outlook-Schutzmaßnahmen ist angemessen.",
    },
    {
      id: "FND003",
      schwere: "Niedrig",
      beschreibung: "Der OCSP-Status des SSL-Zertifikats ist gut.",
    }
  ]
});
</script>

<template>
  <div class="mt-16 md:mt-0">
    <h2 class="text-4xl lg:text-5xl font-bold lg:tracking-tight">
      Sicherheitsüberprüfung der Website
    </h2>
    <p class="text-lg mt-4 text-slate-600">
      Basierend auf den neuesten Sicherheits-Scans wurden die folgenden Ergebnisse ermittelt:
    </p>

    <!-- Dynamische Anzeige des Sicherheits-Scores und der Status-Zusammenfassung -->
    <div class="mt-8">
      <h3 class="text-2xl font-semibold">Sicherheits-Score: {{ jsonData.sicherheits_score }}</h3>
      <p class="text-slate-600 mt-2">{{ jsonData.status_zusammenfassung }}</p>
    </div>

    <!-- Dynamische Anzeige der Findings -->
    <div class="grid sm:grid-cols-1 md:grid-cols-1 mt-8 gap-8">
      <div v-for="item in jsonData.befunde" :key="item.id"
        class="flex gap-4 items-start p-4 border border-gray-200 rounded-lg shadow-sm">
        <!-- Severity Icon -->
        <div class="mt-1 bg-black rounded-full p-2 w-8 h-8 shrink-0">
          <Icon class="text-white" :name="getSeverityIcon(item.schwere)" />
        </div>

        <!-- Finding details -->
        <div>
          <h3 class="font-semibold text-lg">ID: {{ item.id }}</h3>
          <p class="text-slate-500 mt-2 leading-relaxed">
            <strong>Schwere:</strong> {{ item.schwere }}
          </p>
          <p class="text-slate-500 mt-2 leading-relaxed">
            <strong>Beschreibung:</strong> {{ item.beschreibung }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
