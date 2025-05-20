<template>
    <div class="google-auth">
        <div v-if="!user" class="auth-section">
            <h2>Anmelden mit Google</h2>
            <p>Melden Sie sich an, um Ihre Excel-Dateien auszuwählen.</p>
            <button @click="handleSignIn" :disabled="loading">
                {{ loading ? 'Lade...' : 'Mit Google anmelden' }}
            </button>
        </div>

        <div v-else class="file-section">
            <div class="user-info">
                <img :src="user.picture" :alt="user.name" class="user-avatar" />
                <div class="user-details">
                    <h3>{{ user.name }}</h3>
                    <p>{{ user.email }}</p>
                </div>
                <button @click="handleSignOut" class="sign-out">Abmelden</button>
            </div>

            <div class="file-list">
                <h3>Wählen Sie eine Excel-Datei aus:</h3>
                <div v-if="loading" class="loading">Lade Dateien...</div>
                <div v-else-if="error" class="error">{{ error }}</div>
                <div v-else-if="files.length === 0" class="no-files">
                    Keine Excel-Dateien gefunden.
                </div>
                <div v-else class="files">
                    <button v-for="file in files" :key="file.id" @click="selectFile(file)" class="file-button"
                        :class="{ selected: selectedFile?.id === file.id }">
                        {{ file.name }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import type { GoogleUser, GoogleFile } from '../types/google';
import { initGoogleAuth, signIn, signOut, listExcelFiles, readExcelFile } from '../services/google';

const user = ref<GoogleUser | null>(null);
const files = ref<GoogleFile[]>([]);
const selectedFile = ref<GoogleFile | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

const emit = defineEmits<{
    (e: 'fileSelected', items: { title: string; imageUrl: string }[]): void;
}>();

onMounted(async () => {
    try {
        await initGoogleAuth();
    } catch (err) {
        error.value = 'Fehler beim Initialisieren der Google-Authentifizierung';
        console.error(err);
    }
});

async function handleSignIn() {
    loading.value = true;
    error.value = null;
    try {
        user.value = await signIn();
        await loadFiles();
    } catch (err) {
        error.value = 'Fehler bei der Anmeldung';
        console.error(err);
    } finally {
        loading.value = false;
    }
}

async function handleSignOut() {
    loading.value = true;
    error.value = null;
    try {
        await signOut();
        user.value = null;
        files.value = [];
        selectedFile.value = null;
    } catch (err) {
        error.value = 'Fehler beim Abmelden';
        console.error(err);
    } finally {
        loading.value = false;
    }
}

async function loadFiles() {
    loading.value = true;
    error.value = null;
    try {
        files.value = await listExcelFiles();
    } catch (err) {
        error.value = 'Fehler beim Laden der Dateien';
        console.error(err);
    } finally {
        loading.value = false;
    }
}

async function selectFile(file: GoogleFile) {
    loading.value = true;
    error.value = null;
    try {
        selectedFile.value = file;
        const items = await readExcelFile(file.id);
        emit('fileSelected', items);
    } catch (err) {
        error.value = 'Fehler beim Lesen der Datei';
        console.error(err);
    } finally {
        loading.value = false;
    }
}
</script>

<style scoped>
.google-auth {
    max-width: 600px;
    margin: 0 auto;
    padding: 2rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.auth-section {
    text-align: center;
    width: 100%;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
    padding: 1rem;
    background: #2d2d2d;
    border-radius: 12px;
    width: 100%;
}

.user-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
}

.user-details {
    flex: 1;
}

.user-details h3 {
    margin: 0;
    font-size: 1.2rem;
}

.user-details p {
    margin: 0;
    color: #b0b0b0;
}

.file-list {
    margin-top: 2rem;
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.files {
    display: grid;
    gap: 1rem;
    margin-top: 1rem;
    width: 100%;
    max-width: 500px;
}

.file-button {
    padding: 1rem;
    text-align: center;
    background: #2d2d2d;
    border: 2px solid #404040;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    color: #ffffff;
    width: 100%;
}

.file-button:hover {
    border-color: #4CAF50;
    background: #1e3a1e;
}

.file-button.selected {
    border-color: #4CAF50;
    background: #1e3a1e;
}

.sign-out {
    padding: 0.5rem 1rem;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.sign-out:hover {
    background: #d32f2f;
}

.loading,
.error,
.no-files {
    text-align: center;
    padding: 2rem;
    color: #b0b0b0;
}

.error {
    color: #ff6b6b;
}

button {
    padding: 1rem 2rem;
    font-size: 1.1rem;
    background: #4CAF50;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
}

button:hover {
    background: #45a049;
}

button:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}
</style>