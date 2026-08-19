<template>
  <div class="space-y-6 animate-fade-in w-full">
    <!-- TOP BAR HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 backdrop-blur-xl p-6 rounded-2xl border border-slate-800 shadow-xl">
      <div>
        <div class="flex items-center gap-3">
          <h1 class="text-2xl lg:text-3xl font-extrabold text-white tracking-wider">Question Bank</h1>
          <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
            {{ totalQuestions }} Items
          </span>
        </div>
        <p class="text-sm text-slate-400 mt-1">
          Manage system vocabulary, question sentences, hints, themes, and difficulties.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="openImportModal" 
          class="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-sm font-semibold border border-slate-700 transition-all shadow-md hover:border-slate-600"
        >
          <span>📥</span>
          <span>Import CSV</span>
        </button>

        <button 
          @click="openModal()" 
          class="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
        >
          <span>+</span>
          <span>Add Question</span>
        </button>
      </div>
    </div>

    <!-- TOAST NOTIFICATION -->
    <div 
      v-if="toastMessage" 
      :class="[
        'p-4 rounded-xl border flex items-center justify-between transition-all duration-300 shadow-lg',
        toastType === 'success' 
          ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
          : 'bg-red-950/80 border-red-500/40 text-red-300'
      ]"
    >
      <div class="flex items-center gap-2">
        <span>{{ toastType === 'success' ? '✅' : '⚠️' }}</span>
        <span class="text-sm font-medium">{{ toastMessage }}</span>
      </div>
      <button @click="toastMessage = ''" class="text-xs opacity-70 hover:opacity-100">✕</button>
    </div>

    <!-- FILTER & SEARCH CONTROL BAR -->
    <div class="bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row gap-4">
      <!-- SEARCH INPUT -->
      <div class="relative flex-1">
        <span class="absolute left-3.5 top-2.5 text-slate-500">🔍</span>
        <input 
          v-model="searchQuery" 
          @input="onSearchInput"
          type="text" 
          placeholder="Search target word, sentence, or hint..." 
          class="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
        />
      </div>

      <!-- TOPIC / THEME FILTER -->
      <select 
        v-model="filterTheme" 
        @change="fetchQuestions"
        class="bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500 min-w-[160px]"
      >
        <option value="">All Themes / Topics</option>
        <option value="daily-life">Daily Life</option>
        <option value="cafe">Cafe & Dining</option>
        <option value="travel">Travel & Culture</option>
        <option value="Professional">Professional Skills</option>
        <option value="Social">Social Interaction</option>
        <option value="Tech">Critical Thinking & Tech</option>
      </select>

      <!-- DIFFICULTY FILTER -->
      <select 
        v-model="filterDifficulty" 
        @change="fetchQuestions"
        class="bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500 min-w-[160px]"
      >
        <option value="">All Difficulties</option>
        <option value="A1">A1 (Beginner)</option>
        <option value="A2">A2 (Elementary)</option>
        <option value="B1">B1 (Intermediate)</option>
        <option value="B2">B2 (Upper Intermediate)</option>
        <option value="C1">C1 (Advanced)</option>
        <option value="Tier 1">Tier 1</option>
        <option value="Tier 2">Tier 2</option>
        <option value="Tier 3">Tier 3</option>
      </select>

      <!-- ITEMS PER PAGE -->
      <select 
        v-model="limit" 
        @change="fetchQuestions"
        class="bg-slate-950 border border-slate-700/80 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-red-500"
      >
        <option :value="10">10 / page</option>
        <option :value="20">20 / page</option>
        <option :value="50">50 / page</option>
      </select>
    </div>

    <!-- DATA TABLE CONTAINER -->
    <div class="bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-800 overflow-hidden shadow-xl w-full">
      <div class="overflow-x-auto w-full">
        <table class="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr class="bg-slate-950/90 text-slate-400 text-xs font-mono uppercase border-b border-slate-800 tracking-wider">
              <th class="p-4 font-semibold w-24">ID</th>
              <th class="p-4 font-semibold w-40">Target Word</th>
              <th class="p-4 font-semibold min-w-[320px]">Question Sentence</th>
              <th class="p-4 font-semibold min-w-[260px]">Hint / Meaning</th>
              <th class="p-4 font-semibold w-32">Topic</th>
              <th class="p-4 font-semibold text-center w-28">Difficulty</th>
              <th class="p-4 font-semibold text-right w-36">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- LOADING STATE -->
            <template v-if="isLoading">
              <tr v-for="i in 5" :key="i" class="border-b border-slate-800/40">
                <td colspan="7" class="p-4">
                  <div class="h-6 bg-slate-800/60 animate-pulse rounded-lg"></div>
                </td>
              </tr>
            </template>

            <!-- QUESTIONS LIST -->
            <template v-else-if="questions.length > 0">
              <tr 
                v-for="q in questions" 
                :key="q.id" 
                class="border-b border-slate-800/50 hover:bg-slate-800/40 transition-colors text-sm"
              >
                <!-- ID COLUMN -->
                <td class="p-4 font-mono text-xs text-slate-500 whitespace-nowrap" :title="String(q.id)">
                  #{{ formatShortId(q.id) }}
                </td>

                <!-- TARGET WORD COLUMN -->
                <td class="p-4 font-bold text-white tracking-wide font-mono whitespace-nowrap">
                  <span class="px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-800/60 text-red-400 font-semibold shadow-[0_0_8px_rgba(225,29,72,0.15)] inline-block">
                    {{ q.target_word }}
                  </span>
                </td>

                <!-- QUESTION SENTENCE COLUMN (FULL READABLE TEXT) -->
                <td class="p-4 text-slate-200 leading-relaxed font-sans font-medium">
                  {{ q.question_text }}
                </td>

                <!-- HINT / MEANING COLUMN (FULL READABLE TEXT) -->
                <td class="p-4 text-slate-400 leading-relaxed font-normal">
                  {{ q.hint || '—' }}
                </td>

                <!-- TOPIC COLUMN -->
                <td class="p-4 whitespace-nowrap">
                  <span class="px-2.5 py-1 bg-blue-950/60 text-blue-400 rounded-lg text-xs font-mono border border-blue-800/50">
                    {{ q.topic }}
                  </span>
                </td>

                <!-- DIFFICULTY COLUMN -->
                <td class="p-4 text-center whitespace-nowrap">
                  <span :class="getDifficultyBadge(q.difficulty)" class="px-2.5 py-1 rounded-lg text-xs font-mono font-bold border">
                    {{ q.difficulty }}
                  </span>
                </td>

                <!-- ACTIONS COLUMN -->
                <td class="p-4 text-right whitespace-nowrap">
                  <button 
                    @click="openModal(q)" 
                    class="px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg text-xs font-semibold border border-blue-500/30 mr-2 transition-colors"
                  >
                    Edit
                  </button>
                  <button 
                    @click="confirmDelete(q)" 
                    class="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-semibold border border-red-500/30 transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </template>

            <!-- EMPTY STATE -->
            <tr v-else>
              <td colspan="7" class="p-12 text-center text-slate-500">
                <div class="text-3xl mb-2">🔍</div>
                <p class="font-medium text-slate-400">No questions found</p>
                <p class="text-xs text-slate-500 mt-1">Try adjusting your search filters or add a new question.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PAGINATION FOOTER -->
      <div class="p-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div>
          Showing page <span class="text-white font-bold">{{ currentPage }}</span> of <span class="text-white font-bold">{{ totalPages }}</span> ({{ totalQuestions }} items)
        </div>

        <div class="flex items-center gap-2">
          <button 
            @click="changePage(currentPage - 1)" 
            :disabled="currentPage <= 1 || isLoading"
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg border border-slate-700 text-slate-300 transition-colors"
          >
            ← Previous
          </button>
          
          <button 
            @click="changePage(currentPage + 1)" 
            :disabled="currentPage >= totalPages || isLoading"
            class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 rounded-lg border border-slate-700 text-slate-300 transition-colors"
          >
            Next →
          </button>
        </div>
      </div>
    </div>

    <!-- CREATE / EDIT MODAL -->
    <div 
      v-if="isModalOpen" 
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 class="text-xl font-extrabold text-white tracking-wide">
            {{ isEditMode ? 'Edit Question' : 'Add New Question' }}
          </h3>
          <button @click="closeModal" class="text-slate-400 hover:text-white p-1">✕</button>
        </div>

        <div class="space-y-4 text-sm">
          <div>
            <label class="block font-medium text-slate-300 mb-1">Target Word <span class="text-red-400">*</span></label>
            <input 
              v-model="formData.target_word" 
              type="text" 
              placeholder="e.g. collaborate" 
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500 font-mono"
            />
          </div>

          <div>
            <label class="block font-medium text-slate-300 mb-1">Question Sentence / Context</label>
            <textarea 
              v-model="formData.question_text" 
              rows="3"
              placeholder="e.g. They decided to ________ on the new AI project."
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500"
            ></textarea>
          </div>

          <div>
            <label class="block font-medium text-slate-300 mb-1">Hint / Meaning</label>
            <input 
              v-model="formData.hint" 
              type="text" 
              placeholder="e.g. Work jointly on an activity" 
              class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium text-slate-300 mb-1">Topic / Theme</label>
              <input 
                v-model="formData.topic" 
                type="text" 
                placeholder="e.g. Professional" 
                class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label class="block font-medium text-slate-300 mb-1">Difficulty</label>
              <select 
                v-model="formData.difficulty" 
                class="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-red-500"
              >
                <option value="A1">A1 (Beginner)</option>
                <option value="A2">A2 (Elementary)</option>
                <option value="B1">B1 (Intermediate)</option>
                <option value="B2">B2 (Upper Int)</option>
                <option value="C1">C1 (Advanced)</option>
                <option value="Tier 1">Tier 1</option>
                <option value="Tier 2">Tier 2</option>
                <option value="Tier 3">Tier 3</option>
              </select>
            </div>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-800 flex justify-end gap-3">
          <button 
            @click="closeModal" 
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="saveQuestion" 
            :disabled="isSubmitting"
            class="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Question' }}
          </button>
        </div>
      </div>
    </div>

    <!-- CSV IMPORT MODAL -->
    <div 
      v-if="isImportModalOpen" 
      class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in"
    >
      <div class="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <h3 class="text-xl font-extrabold text-white tracking-wide">
            📥 Import Questions CSV
          </h3>
          <button @click="isImportModalOpen = false" class="text-slate-400 hover:text-white p-1">✕</button>
        </div>

        <div class="space-y-4 text-sm">
          <p class="text-slate-300 leading-relaxed">
            Upload a standard CSV file with headers: <code class="bg-slate-950 px-1.5 py-0.5 rounded text-red-400 font-mono text-xs">target_word, question_text, hint, topic, difficulty</code>.
          </p>

          <div 
            class="border-2 border-dashed border-slate-700 hover:border-red-500 rounded-2xl p-8 text-center transition-colors bg-slate-950/50 cursor-pointer"
            @click="$refs.fileInput.click()"
          >
            <div class="text-4xl mb-2">📄</div>
            <p class="font-semibold text-white">Click to select CSV file</p>
            <p class="text-xs text-slate-500 mt-1">{{ selectedFile ? selectedFile.name : 'Format: .csv (UTF-8)' }}</p>
            <input 
              ref="fileInput" 
              type="file" 
              accept=".csv" 
              class="hidden" 
              @change="onFileSelected"
            />
          </div>

          <div class="flex justify-between items-center text-xs text-slate-400 pt-2">
            <span>Need a template?</span>
            <button @click="downloadCsvTemplate" class="text-blue-400 hover:underline">
              Download Sample CSV
            </button>
          </div>
        </div>

        <div class="pt-4 border-t border-slate-800 flex justify-end gap-3">
          <button 
            @click="isImportModalOpen = false" 
            class="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-sm font-semibold text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button 
            @click="submitImport" 
            :disabled="!selectedFile || isSubmitting"
            class="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-[0_0_15px_rgba(220,38,38,0.4)]"
          >
            {{ isSubmitting ? 'Importing...' : 'Start Import' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchWithAuth } from '../../services/api'

interface QuestionItem {
  id?: number | string
  target_word: string
  question_text: string
  hint: string
  topic: string
  difficulty: string
}

// STATE
const questions = ref<QuestionItem[]>([])
const totalQuestions = ref(0)
const currentPage = ref(1)
const totalPages = ref(1)
const limit = ref(10)
const searchQuery = ref('')
const filterTheme = ref('')
const filterDifficulty = ref('')
const isLoading = ref(false)
const isSubmitting = ref(false)

// MODAL STATES
const isModalOpen = ref(false)
const isEditMode = ref(false)
const isImportModalOpen = ref(false)
const selectedFile = ref<File | null>(null)
const formData = ref<QuestionItem>({
  target_word: '',
  question_text: '',
  hint: '',
  topic: 'Professional',
  difficulty: 'A1'
})

// TOAST
const toastMessage = ref('')
const toastType = ref<'success' | 'error'>('success')

function formatShortId(id: number | string | undefined): string {
  if (!id) return '—'
  const str = id.toString()
  if (str.length > 10) {
    return str.slice(0, 8) + '...'
  }
  return str
}

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toastMessage.value = msg
  toastType.value = type
  setTimeout(() => {
    if (toastMessage.value === msg) toastMessage.value = ''
  }, 4000)
}

let searchDebounce: any = null

function onSearchInput() {
  if (searchDebounce) clearTimeout(searchDebounce)
  searchDebounce = setTimeout(() => {
    currentPage.value = 1
    fetchQuestions()
  }, 400)
}

async function fetchQuestions() {
  isLoading.value = true
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: limit.value.toString(),
      search: searchQuery.value,
      topic: filterTheme.value,
      difficulty: filterDifficulty.value
    })

    const res = await fetchWithAuth(`/api/admin/questions?${params.toString()}`)
    if (res.ok) {
      const result = await res.json()
      if (result.success && result.data) {
        questions.value = result.data.questions || []
        totalQuestions.value = result.data.total || 0
        totalPages.value = result.data.totalPages || 1
      }
    }
  } catch (err) {
    console.error('Failed to fetch questions:', err)
    showToast('Failed to load questions from server', 'error')
  } finally {
    isLoading.value = false
  }
}

function changePage(newPage: number) {
  if (newPage < 1 || newPage > totalPages.value) return
  currentPage.value = newPage
  fetchQuestions()
}

function openModal(question: QuestionItem | null = null) {
  if (question) {
    isEditMode.value = true
    formData.value = { ...question }
  } else {
    isEditMode.value = false
    formData.value = {
      target_word: '',
      question_text: '',
      hint: '',
      topic: 'Professional',
      difficulty: 'A1'
    }
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function saveQuestion() {
  if (!formData.value.target_word.trim()) {
    showToast('Target word is required', 'error')
    return
  }

  isSubmitting.value = true
  try {
    const url = isEditMode.value 
      ? `/api/admin/questions/${formData.value.id}` 
      : '/api/admin/questions'
    const method = isEditMode.value ? 'PUT' : 'POST'

    const res = await fetchWithAuth(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })

    if (res.ok) {
      showToast(isEditMode.value ? 'Question updated' : 'Question created', 'success')
      closeModal()
      fetchQuestions()
    } else {
      const errData = await res.json()
      showToast(errData.message || 'Failed to save question', 'error')
    }
  } catch (err) {
    console.error('Failed to save question:', err)
    showToast('Error saving question', 'error')
  } finally {
    isSubmitting.value = false
  }
}

async function confirmDelete(q: QuestionItem) {
  if (!confirm(`Are you sure you want to delete vocabulary "${q.target_word}"?`)) return

  try {
    const res = await fetchWithAuth(`/api/admin/questions/${q.id}`, {
      method: 'DELETE'
    })

    if (res.ok) {
      showToast('Question deleted', 'success')
      fetchQuestions()
    } else {
      showToast('Failed to delete question', 'error')
    }
  } catch (err) {
    console.error('Failed to delete question:', err)
    showToast('Error deleting question', 'error')
  }
}

function openImportModal() {
  selectedFile.value = null
  isImportModalOpen.value = true
}

function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

async function submitImport() {
  if (!selectedFile.value) return

  isSubmitting.value = true
  const reader = new FileReader()

  reader.onload = async (e) => {
    const csvText = e.target?.result as string
    try {
      const res = await fetchWithAuth('/api/admin/questions/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText })
      })

      if (res.ok) {
        const result = await res.json()
        showToast(result.message || 'CSV Imported successfully!', 'success')
        isImportModalOpen.value = false
        fetchQuestions()
      } else {
        const errData = await res.json()
        showToast(errData.message || 'Failed to import CSV', 'error')
      }
    } catch (err) {
      console.error('Import failed:', err)
      showToast('CSV import failed', 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  reader.readAsText(selectedFile.value)
}

function downloadCsvTemplate() {
  const sampleCsv = `target_word,question_text,hint,topic,difficulty\ncollaborate,"They decided to ________ on the project.",Work together,Professional,B1\nalgorithm,"The developers optimized the sorting ________.",Step by step procedure,Tech,B2\ngreet,"He gave a warm ________ to all incoming guests.",Friendly reception,Social,A1`
  const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', 'naenra_question_template.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function getDifficultyBadge(diff: string) {
  if (diff === 'A1' || diff === 'A2' || diff === 'Tier 1') {
    return 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50'
  }
  if (diff === 'B1' || diff === 'B2' || diff === 'Tier 2') {
    return 'bg-amber-950/60 text-amber-400 border-amber-800/50'
  }
  return 'bg-red-950/60 text-red-400 border-red-800/50'
}

onMounted(() => {
  fetchQuestions()
})
</script>