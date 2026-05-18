<script setup>
import { ref } from 'vue';
import FaIcon from '../components/FaIcon.vue';
import Folder from '../components/Folder.vue';
import { marked } from 'marked';

// inspiration https://buildin.ai/share/b62ac37b-7748-49cb-aa7c-9bb028490a4b https://itsfoss.com/open-source-second-brain-apps/
// todo mindmap und utm wär auch cool

const open = ref(false)
const document = ref(null)
const editing = ref(false)

const documents = {
    '1': {
        id: '1',
        title: 'Meeting notes',
        content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
    },
    '2': {
        id: '2',
        title: 'Project ideasProject ideasProject ideasProject ideasProject ideasProject ideasProject ideasProject ideasProject ideasProject ideas',
        content: '## h2 \n ### h3 \n --- \n Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
    }
}

const folders = [
    {
        path: '/todo',
        name: 'Todo',
        color: '#ff0000',
        documents: [
            {
                id: '1',
                title: 'Meeting notes'
            },
            {
                id: '2',
                title: 'Project ideas'
            }
        ],
        folders: [
            {
                path: '/todo/work',
                name: 'Work',
                color: '#00ff00',
                folders: [
                    {  
                        path: '/todo/work/project1',
                        name: 'Project 1',
                        color: '#0000ff',
                        folders: []
                    },
                    {
                        path: '/todo/work/project2',
                        name: 'Project 2',
                        color: '#ffff00',   
                        folders: []
                    }
                ]   
            },
            {
                path: '/todo/personal',
                name: 'Personal',
                color: '#ff00ff',
                folders: [
                    {   
                        path: '/todo/personal/fitness',
                        name: 'Fitness',
                        color: '#00ffff',
                        folders: []
                    },
                    {   
                        path: '/todo/personal/hobbies',
                        name: 'Hobbies',
                        color: '#ff8800',
                        folders: []
                    }   
                ]
            }
        ]
    },
    {
        path: '/notes',
        name: 'Notes',
        color: '#888888',
        folders: []
    }
]
</script>

<template>
    <div
        class="absolute z-9 bg-body shadow-lg min-w-[52px]" 
        :class="{'min-w-[200px]': open}
    ">
        <button
            type="button"
            @click="open = !open"
            class="p-4 absolute top-0"
            :class="{'right-0': open}"
        >
            <span v-if="open">
                <FaIcon icon="fa-angles-left"/>
            </span>
            <span v-else>
                <FaIcon icon="fa-angles-right"/>
            </span>
        </button>
        <div v-if="open" class="pt-3">
            <folder
                v-for="folder in folders"
                :key="folder.path" 
                :folder="folder"
                @open-document="document = documents[$event.id]; open = false"
            />
        </div>
    </div>
    <div class="!pl-[52px]">
        <div v-if="document" class="!pt-0 container">
            <div class="flex justify-between items-start">
                <div v-if="!editing" v-text="document.title" class="pt-4 text-lg"></div>
                <input v-if="editing" v-model="document.title" class="w-full"/>
                <button class="p-4 pr-3" @click="editing = !editing">
                    <span v-if="editing">
                        <FaIcon icon="fa-save"/>
                    </span>
                    <span v-else>   
                        <FaIcon icon="fa-pencil"/>
                    </span> 
                </button>
            </div>
            <div v-if="!editing" v-html="marked(document.content)">
            </div>
            <div v-if="editing">
                <textarea v-model="document.content" class="w-full size-[80vh]"></textarea>
            </div>
        </div>
    </div>
</template>