<script setup>
import { ref } from 'vue';
import FaIcon from './FaIcon.vue';

const props = defineProps({
    folder: {
        type: Object,
        required: true
    }
})
const open = ref(false)
</script>

<template>
    <div>
        <button type="button" @click="open = !open" class="px-4 py-1 cursor-pointer">
            <span :style="{ color: folder.color }" class="mr-2">
                <span v-if="open">
                    <FaIcon icon="fa-regular fa-folder-open"/>
                </span>
                <span v-else>
                    <FaIcon icon="fa-regular fa-folder"/>
                </span>
            </span>
            {{ folder.name }}
        </button>
        <div v-if="open" class="pl-4">
            <button v-for="document in folder.documents" :key="document.id" class="px-4 py-1 block cursor-pointer" @click="$emit('open-document', document)">
                <FaIcon icon="fa-regular fa-file" class="mr-2"/> {{ document.title }}
            </button>
            <Folder v-for="folder in folder.folders" :key="folder.path" :folder="folder"/>
            <button type="button" class="px-4 py-1 block cursor-pointer">
                <FaIcon icon="fa-plus" class="mr-2"/> Ordner
            </button>
            <button type="button" class="px-4 py-1 block cursor-pointer">
                <FaIcon icon="fa-plus" class="mr-2"/> Notiz
            </button>
        </div>
    </div>
</template>