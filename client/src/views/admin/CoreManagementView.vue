<template>
  <div class="space-y-6 animate-fade-in">
    <!-- PAGE HEADER: SYNCHRONIZED WITH PLAYER MANAGEMENT & OTHER ADMIN VIEWS -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h2 class="text-2xl font-black text-white tracking-wide flex items-center gap-2.5">
          <span>⚡</span>
          <span>Support Cores & Game Configs</span>
        </h2>
        <p class="text-xs text-slate-400 mt-1">
          Manage the catalog of Upgrade Cores, tune stat multipliers, flat bonuses, and drop pool status.
        </p>
      </div>

      <div class="flex items-center gap-3">
        <button 
          @click="fetchCores" 
          :disabled="isLoading"
          class="flex items-center gap-2 px-3.5 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold font-mono transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <svg class="w-4 h-4 text-cyan-400" :class="{ 'animate-spin': isLoading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh Data</span>
        </button>
      </div>
    </div>

    <!-- 4 KPI SUMMARY CARDS: SYNCHRONIZED SIZE & LAYOUT WITH PLAYER MANAGEMENT -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <!-- KPI 1: TOTAL CORES -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-cyan-500/40 rounded-2xl flex flex-col justify-between shadow-lg transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Total Cores</span>
          <div class="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-sm">
            ⚡
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-black text-white font-mono tracking-tight">{{ stats.totalCores }}</span>
          <p class="text-[11px] text-slate-500 mt-1 font-mono">Catalog models in DB</p>
        </div>
      </div>

      <!-- KPI 2: ACTIVE MATCH POOL -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-emerald-500/40 rounded-2xl flex flex-col justify-between shadow-lg transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Active Pool</span>
          <div class="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-sm">
            🟢
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-black text-emerald-400 font-mono tracking-tight">{{ stats.activeCores }}</span>
          <p class="text-[11px] text-emerald-500/80 mt-1 font-mono">Enabled in drop pool</p>
        </div>
      </div>

      <!-- KPI 3: DISABLED CORES -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-red-500/40 rounded-2xl flex flex-col justify-between shadow-lg transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Disabled Cores</span>
          <div class="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-sm">
            🚫
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-black text-red-400 font-mono tracking-tight">{{ stats.disabledCores }}</span>
          <p class="text-[11px] text-red-500/80 mt-1 font-mono">Banned from selection pool</p>
        </div>
      </div>

      <!-- KPI 4: AVG MULTIPLIER POWER -->
      <div class="p-5 bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 hover:border-amber-500/40 rounded-2xl flex flex-col justify-between shadow-lg transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider font-mono">Avg Multiplier</span>
          <div class="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-sm">
            ✨
          </div>
        </div>
        <div class="mt-4">
          <span class="text-3xl font-black text-amber-400 font-mono tracking-tight">x{{ stats.avgMultiplier.toFixed(2) }}</span>
          <p class="text-[11px] text-slate-500 mt-1 font-mono">Catalog strategy strength</p>
        </div>
      </div>
    </div>

    <!-- META BALANCER & HOTFIX ACCORDION / TOGGLE -->
    <div class="space-y-3">
      <div class="flex items-center justify-between">
        <button
          @click="showMetaBalancer = !showMetaBalancer"
          class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-xs font-mono font-bold text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <span>⚖️</span>
          <span>{{ showMetaBalancer ? 'Hide Meta Balancer & Hotfix Sliders' : 'Open Support Core Meta Balancer & Hotfix Sliders' }}</span>
          <span class="px-1.5 py-0.2 text-[9px] rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">HOTFIX</span>
        </button>
      </div>

      <CoreMetaBalancerCard v-if="showMetaBalancer" />
    </div>

    <!-- FILTER & SEARCH CONTROLS: SYNCHRONIZED WITH PLAYER MANAGEMENT BAR -->
    <div class="p-4 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-lg flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      <!-- Search Bar -->
      <div class="relative flex-1 max-w-md">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search core by name, description, or family..."
          class="w-full pl-10 pr-8 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors font-mono"
        />
        <button 
          v-if="searchQuery" 
          @click="searchQuery = ''" 
          class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Filters & View Switcher Controls -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Family Select -->
        <select 
          v-model="selectedFamily"
          class="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-mono font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option v-for="fam in familyOptions" :key="fam.id" :value="fam.id">
            {{ fam.label }}
          </option>
        </select>

        <!-- Tier Select -->
        <select 
          v-model="selectedTier"
          class="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-mono font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="all">All Tiers</option>
          <option value="1">Tier 1 (Main Core)</option>
          <option value="2">Tier 2 (Upgrade)</option>
          <option value="3">Tier 3 (Mastery)</option>
        </select>

        <!-- Status Select -->
        <select 
          v-model="selectedStatus"
          class="bg-slate-950/80 border border-slate-800 text-slate-200 text-xs font-mono font-semibold rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-cyan-500 cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="active">Active Drop Pool</option>
          <option value="disabled">Disabled Cores</option>
        </select>

        <!-- VIEW MODE SWITCHER (GRID vs TABLE) -->
        <div class="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
          <button 
            @click="viewMode = 'grid'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5',
              viewMode === 'grid' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            ]"
            title="Switch to Grid View"
          >
            <span>📱</span>
            <span>Grid</span>
          </button>
          <button 
            @click="viewMode = 'table'"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold font-mono transition-all cursor-pointer flex items-center gap-1.5',
              viewMode === 'table' 
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shadow-sm' 
                : 'text-slate-400 hover:text-white'
            ]"
            title="Switch to Table View"
          >
            <span>📄</span>
            <span>Table</span>
          </button>
        </div>
      </div>
    </div>

    <!-- RESULTS COUNT BADGE & RESET -->
    <div class="flex items-center justify-between px-1 text-xs font-mono text-slate-400">
      <p>Showing <span class="text-white font-bold">{{ filteredCores.length }}</span> of {{ cores.length }} registered cores</p>
      <button 
        v-if="selectedFamily !== 'all' || selectedTier !== 'all' || selectedStatus !== 'all' || searchQuery"
        @click="resetFilters"
        class="text-cyan-400 hover:underline cursor-pointer"
      >
        Reset Filters
      </button>
    </div>

    <!-- CORE LISTING: GRID VIEW -->
    <div v-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <!-- EMPTY FILTERED RESULTS -->
      <div v-if="filteredCores.length === 0" class="col-span-full py-16 bg-slate-900/40 border border-slate-800 rounded-2xl text-center">
        <span class="text-3xl mb-2 block">🔍</span>
        <p class="text-sm font-bold text-white font-mono">No Cores Match Filter Criteria</p>
        <p class="text-xs text-slate-400 mt-1">Try resetting your family, tier, or search query filter.</p>
        <button @click="resetFilters" class="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-mono font-bold rounded-xl border border-slate-700 cursor-pointer">
          Reset All Filters
        </button>
      </div>

      <!-- CORE CARDS -->
      <div 
        v-else
        v-for="core in filteredCores" 
        :key="core.id"
        :class="[
          'bg-slate-900/90 border rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between transition-all duration-300 group shadow-lg',
          core.is_active 
            ? 'border-slate-800 hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.15)]' 
            : 'border-red-900/40 bg-slate-950/90 opacity-75 grayscale-[0.3]'
        ]"
      >
        <!-- Top Core Badges & Active Toggle Switch -->
        <div>
          <div class="flex items-start justify-between gap-3 mb-3">
            <div class="flex items-center gap-2.5">
              <!-- Icon -->
              <div class="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800 p-1.5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <img 
                  :src="getCoreIconPath(core.name)" 
                  :alt="core.name"
                  class="w-full h-full object-contain"
                  @error="(e) => (e.target as HTMLImageElement).src = '/images/cores/aegis_shield.png'"
                />
              </div>
              <div>
                <h3 class="font-black text-white text-sm uppercase tracking-wide group-hover:text-cyan-400 transition-colors">
                  {{ core.name }}
                </h3>
                <div class="flex items-center gap-1.5 mt-0.5">
                  <!-- Tier Badge -->
                  <span 
                    class="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded border uppercase"
                    :class="getTierBadgeClass(core.tier)"
                  >
                    T{{ core.tier }}
                  </span>
                  <!-- Family Label -->
                  <span class="text-[10px] font-mono text-cyan-400/90 font-bold uppercase">
                    {{ getCoreFamilyName(core.name) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- IS_ACTIVE TOGGLE SWITCH -->
            <div class="flex flex-col items-end gap-1 shrink-0">
              <button 
                @click="toggleActive(core)" 
                :disabled="togglingIds.includes(core.id)"
                :class="[
                  'w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer relative shadow-inner border',
                  core.is_active 
                    ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                    : 'bg-slate-800 border-slate-700'
                ]"
                :title="core.is_active ? 'Click to disable from drop pool' : 'Click to enable in drop pool'"
              >
                <div 
                  :class="[
                    'w-4 h-4 rounded-full bg-white transition-transform shadow-md transform flex items-center justify-center text-[8px]',
                    core.is_active ? 'translate-x-5' : 'translate-x-0'
                  ]"
                >
                  <span v-if="togglingIds.includes(core.id)" class="animate-spin text-slate-900">⏳</span>
                </div>
              </button>
              <span :class="['text-[9px] font-mono font-black uppercase', core.is_active ? 'text-emerald-400' : 'text-red-400']">
                {{ core.is_active ? 'DROP READY' : 'DISABLED' }}
              </span>
            </div>
          </div>

          <!-- Description -->
          <p class="text-xs text-slate-400 leading-relaxed mb-4 line-clamp-3 min-h-[3.3rem]">
            {{ core.description }}
          </p>
        </div>

        <div>
          <!-- Stats Breakdown Pills -->
          <div class="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 font-mono text-center mb-3">
            <div>
              <p class="text-[9px] text-slate-500 uppercase font-bold">Flat Bonus</p>
              <p class="text-xs font-bold text-emerald-400">+{{ core.flat_buff }}</p>
            </div>
            <div>
              <p class="text-[9px] text-slate-500 uppercase font-bold">Multiplier</p>
              <p class="text-xs font-bold text-amber-400">x{{ core.multiplier_buff }}</p>
            </div>
            <div>
              <p class="text-[9px] text-slate-500 uppercase font-bold">Duration</p>
              <p class="text-xs font-bold text-cyan-400">{{ core.duration }}s</p>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex items-center gap-2 pt-2 border-t border-slate-800/80">
            <button 
              @click="openEditModal(core)" 
              class="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>✏️ Edit Stats</span>
            </button>
            <button 
              @click="confirmDelete(core)" 
              class="px-2.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 rounded-lg text-xs font-semibold border border-red-800/50 transition-colors cursor-pointer"
              title="Delete Core"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- CORE LISTING: TABLE VIEW -->
    <div v-else class="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px] tracking-wider">
              <th class="py-3.5 px-4">Core Model</th>
              <th class="py-3.5 px-4 text-center">Family</th>
              <th class="py-3.5 px-4 text-center">Tier</th>
              <th class="py-3.5 px-4 text-center">Flat Bonus</th>
              <th class="py-3.5 px-4 text-center">Multiplier</th>
              <th class="py-3.5 px-4 text-center">Duration</th>
              <th class="py-3.5 px-4 text-center">Drop Pool Active</th>
              <th class="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800/60 font-mono">
            <tr v-if="isLoading">
              <td colspan="8" class="py-12 text-center text-slate-500 font-mono">
                <div class="inline-flex items-center gap-2">
                  <svg class="w-5 h-5 animate-spin text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75"></path>
                  </svg>
                  <span>Loading core catalog configurations...</span>
                </div>
              </td>
            </tr>

            <tr v-else-if="filteredCores.length === 0">
              <td colspan="8" class="py-12 text-center text-slate-500 font-mono">
                No cores match your search filter criteria.
              </td>
            </tr>

            <tr 
              v-else
              v-for="core in filteredCores" 
              :key="core.id"
              :class="['hover:bg-slate-800/40 transition-colors group', !core.is_active ? 'opacity-70 bg-slate-950/60' : '']"
            >
              <td class="py-3.5 px-4 font-sans">
                <div class="flex items-center gap-3">
                  <img 
                    :src="getCoreIconPath(core.name)" 
                    :alt="core.name" 
                    class="w-8 h-8 rounded-lg border border-slate-700 bg-slate-950 object-contain p-1 shrink-0" 
                    @error="(e) => (e.target as HTMLImageElement).src = '/images/cores/aegis_shield.png'"
                  />
                  <div>
                    <p class="font-bold text-white uppercase group-hover:text-cyan-400 transition-colors flex items-center gap-2">
                      <span>{{ core.name }}</span>
                    </p>
                    <p class="text-[10px] text-slate-400 line-clamp-1 max-w-xs">{{ core.description }}</p>
                  </div>
                </div>
              </td>

              <td class="py-3.5 px-4 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-cyan-400 border border-slate-700">
                  {{ getCoreFamilyName(core.name) }}
                </span>
              </td>

              <td class="py-3.5 px-4 text-center">
                <span class="px-2 py-0.5 rounded text-[10px] font-bold border uppercase" :class="getTierBadgeClass(core.tier)">
                  Tier {{ core.tier }}
                </span>
              </td>

              <td class="py-3.5 px-4 text-center text-emerald-400 font-bold">
                +{{ core.flat_buff }} pts
              </td>

              <td class="py-3.5 px-4 text-center text-amber-400 font-bold">
                x{{ core.multiplier_buff }}
              </td>

              <td class="py-3.5 px-4 text-center text-cyan-400 font-bold">
                {{ core.duration }}s
              </td>

              <!-- TOGGLE SWITCH TABLE CELL -->
              <td class="py-3.5 px-4 text-center">
                <div class="inline-flex items-center gap-2">
                  <button 
                    @click="toggleActive(core)" 
                    :disabled="togglingIds.includes(core.id)"
                    :class="[
                      'w-10 h-5 rounded-full p-0.5 transition-colors cursor-pointer relative shadow-inner border',
                      core.is_active 
                        ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]' 
                        : 'bg-slate-800 border-slate-700'
                    ]"
                  >
                    <div 
                      :class="[
                        'w-3.5 h-3.5 rounded-full bg-white transition-transform shadow-md transform',
                        core.is_active ? 'translate-x-5' : 'translate-x-0'
                      ]"
                    ></div>
                  </button>
                  <span :class="['text-[10px] font-bold uppercase', core.is_active ? 'text-emerald-400' : 'text-red-400']">
                    {{ core.is_active ? 'ACTIVE' : 'DISABLED' }}
                  </span>
                </div>
              </td>

              <td class="py-3.5 px-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="openEditModal(core)" 
                    class="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[11px] font-semibold border border-slate-700 transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button 
                    @click="confirmDelete(core)" 
                    class="px-2.5 py-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 hover:text-red-200 rounded text-[11px] font-semibold border border-red-800/50 transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- EDIT FORM MODAL -->
    <div v-if="isFormModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div @click="closeFormModal" class="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>

      <div class="relative bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 w-full max-w-xl shadow-[0_0_50px_rgba(6,182,212,0.3)] z-10 space-y-5 animate-in fade-in zoom-in duration-200">
        <!-- Modal Title Header -->
        <div class="flex items-center justify-between border-b border-slate-800 pb-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-xl">
              ⚡
            </div>
            <div>
              <h3 class="text-lg font-black text-white uppercase tracking-wide">
                EDIT CORE CONFIGURATIONS
              </h3>
              <p class="text-xs text-cyan-400 font-mono">Strategy Pattern Parameter Tuning</p>
            </div>
          </div>
          <button @click="closeFormModal" class="text-slate-400 hover:text-white text-lg font-mono cursor-pointer">✕</button>
        </div>

        <!-- FORM INPUTS -->
        <form @submit.prevent="submitForm" class="space-y-4">
          <!-- Name & Classification -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">Core Name *</label>
              <input 
                v-model="formData.name"
                type="text" 
                required
                placeholder="e.g. Phoenix Flame"
                class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label class="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">Classification / Family</label>
              <input 
                v-model="formData.classification"
                type="text" 
                placeholder="e.g. Aegis / Phoenix"
                class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <!-- Description -->
          <div>
            <label class="block text-xs font-mono font-bold text-slate-300 uppercase mb-1">Stat & Strategy Description *</label>
            <textarea 
              v-model="formData.description"
              rows="3"
              required
              placeholder="Describe core stat bonus and tactical mechanic..."
              class="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-sans text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
            ></textarea>
          </div>

          <!-- Tier, Flat Buff, Multiplier, Duration -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">Tier Level</label>
              <select 
                v-model.number="formData.tier"
                class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option :value="1">Tier 1</option>
                <option :value="2">Tier 2</option>
                <option :value="3">Tier 3</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">Flat Bonus (pts)</label>
              <input 
                v-model.number="formData.flat_buff"
                type="number"
                step="5"
                placeholder="0"
                class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-emerald-400 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label class="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">Multiplier</label>
              <input 
                v-model.number="formData.multiplier_buff"
                type="number"
                step="0.1"
                min="0.5"
                max="15.0"
                placeholder="1.0"
                class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-amber-400 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label class="block text-[11px] font-mono font-bold text-slate-300 uppercase mb-1">Duration (s)</label>
              <input 
                v-model.number="formData.duration"
                type="number"
                step="1"
                min="0"
                placeholder="0"
                class="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-cyan-400 font-bold focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <!-- Active Toggle Switch in Form -->
          <div class="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <p class="text-xs font-bold text-white font-mono">Enable in Match Drop Pool (is_active)</p>
              <p class="text-[10px] text-slate-400">When disabled, this core will not drop during match selection.</p>
            </div>

            <button 
              type="button"
              @click="formData.is_active = !formData.is_active"
              :class="[
                'w-12 h-6.5 rounded-full p-0.5 transition-colors cursor-pointer relative border shrink-0',
                formData.is_active 
                  ? 'bg-emerald-600 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.4)]' 
                  : 'bg-slate-800 border-slate-700'
              ]"
            >
              <div 
                :class="[
                  'w-5 h-5 rounded-full bg-white transition-transform shadow-md transform',
                  formData.is_active ? 'translate-x-5.5' : 'translate-x-0'
                ]"
              ></div>
            </button>
          </div>

          <!-- Form Buttons -->
          <div class="flex items-center gap-3 pt-3">
            <button 
              type="button" 
              @click="closeFormModal" 
              class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              :disabled="isSubmitting"
              class="flex-1 py-3 bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-xl border border-cyan-400/40 shadow-lg cursor-pointer flex items-center justify-center gap-2"
            >
              <svg v-if="isSubmitting" class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" class="opacity-25"></circle>
                <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" class="opacity-75"></path>
              </svg>
              <span>{{ isSubmitting ? 'Saving Config...' : (formMode === 'create' ? 'Create Core' : 'Save Changes') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE CONFIRMATION MODAL -->
    <div v-if="deletingCore" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div @click="deletingCore = null" class="absolute inset-0 bg-slate-950/80 backdrop-blur-md"></div>
      <div class="relative bg-slate-900 border-2 border-red-500/80 rounded-2xl p-6 w-full max-w-sm shadow-2xl z-10 space-y-4">
        <div class="flex items-center gap-3 text-red-500">
          <div class="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-xl shrink-0">
            ⚠️
          </div>
          <div>
            <h3 class="text-base font-bold text-white uppercase">Confirm Core Deletion</h3>
            <p class="text-xs text-red-400 font-mono">Catalog Removal</p>
          </div>
        </div>
        <p class="text-xs text-slate-300 leading-relaxed">
          Are you sure you want to delete core <strong class="text-white">{{ deletingCore.name }}</strong>? Players will no longer be able to upgrade into this core.
        </p>
        <div class="flex items-center gap-3 pt-2">
          <button @click="deletingCore = null" class="flex-1 py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer">Cancel</button>
          <button @click="executeDelete" class="flex-1 py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold uppercase rounded-xl shadow-lg cursor-pointer">Delete Core</button>
        </div>
      </div>
    </div>

    <!-- SUCCESS TOAST NOTIFICATION -->
    <div v-if="toastMessage" class="fixed bottom-6 right-6 z-50 bg-slate-900 border-2 border-cyan-500 text-cyan-200 px-5 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-mono text-xs animate-in slide-in-from-bottom duration-300">
      <span class="text-xl">✅</span>
      <div>
        <p class="font-bold text-white">System Config Updated</p>
        <p class="text-[11px] text-cyan-300 mt-0.5">{{ toastMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchWithAuth } from '../../services/api'
import { getCoreIconPath } from '../../game/cores/icons'
import { getCoreFamily } from '../../game/cores/families'
import CoreMetaBalancerCard from '../../components/admin/CoreMetaBalancerCard.vue'

const showMetaBalancer = ref(false)

interface CoreConfig {
  id: string
  name: string
  description: string
  classification: string
  core_type: string
  tier: number
  flat_buff: number
  multiplier_buff: number
  duration: number
  is_active: boolean
  icon_url?: string | null
  upgrades_to?: string | null
  created_at?: string
}

const cores = ref<CoreConfig[]>([])
const stats = ref({
  totalCores: 0,
  activeCores: 0,
  disabledCores: 0,
  avgMultiplier: 1.25
})

const isLoading = ref(false)
const isSubmitting = ref(false)
const searchQuery = ref('')
const selectedFamily = ref('all')
const selectedTier = ref('all')
const selectedStatus = ref('all')
const viewMode = ref<'grid' | 'table'>('grid')

const togglingIds = ref<string[]>([])
const deletingCore = ref<CoreConfig | null>(null)
const toastMessage = ref('')

const isFormModalOpen = ref(false)
const formMode = ref<'create' | 'edit'>('create')
const selectedCoreId = ref<string | null>(null)

const formData = ref({
  name: '',
  description: '',
  classification: 'Special',
  tier: 1,
  flat_buff: 0,
  multiplier_buff: 1.0,
  duration: 0,
  is_active: true
})

const familyOptions = [
  { id: 'all', label: 'All Families' },
  { id: 'combo', label: 'Combo Family' },
  { id: 'speedster', label: 'Speedster Family' },
  { id: 'oracle', label: 'Oracle Family' },
  { id: 'aegis', label: 'Aegis Family' },
  { id: 'mission', label: 'Mission Family' },
  { id: 'pandora', label: 'Pandora Family' },
  { id: 'phoenix', label: 'Phoenix Family' },
  { id: 'highroller', label: 'High Roller' },
  { id: 'power', label: 'Power Family' },
  { id: 'balanced', label: 'Balanced Family' }
]

function getCoreFamilyName(coreName: string): string {
  const fam = getCoreFamily(coreName)
  if (!fam) return 'Special'
  return fam.charAt(0).toUpperCase() + fam.slice(1)
}

function resetFilters() {
  searchQuery.value = ''
  selectedFamily.value = 'all'
  selectedTier.value = 'all'
  selectedStatus.value = 'all'
}

const filteredCores = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  const familyFilter = selectedFamily.value.toLowerCase()
  const tierFilter = selectedTier.value
  const statusFilter = selectedStatus.value

  return cores.value.filter(core => {
    // 1. Search Query matching
    const matchesSearch = !q || 
      core.name.toLowerCase().includes(q) || 
      core.description.toLowerCase().includes(q) ||
      (getCoreFamily(core.name) || '').toLowerCase().includes(q)

    // 2. Family Filter
    const coreFamily = (getCoreFamily(core.name) || core.classification || '').toLowerCase()
    const matchesFamily = familyFilter === 'all' || coreFamily.includes(familyFilter)

    // 3. Tier Filter
    const matchesTier = tierFilter === 'all' || core.tier === parseInt(tierFilter)

    // 4. Status Filter
    let matchesStatus = true
    if (statusFilter === 'active') matchesStatus = core.is_active
    if (statusFilter === 'disabled') matchesStatus = !core.is_active

    return matchesSearch && matchesFamily && matchesTier && matchesStatus
  })
})

async function fetchCores() {
  isLoading.value = true
  try {
    const res = await fetchWithAuth('/api/admin/cores')
    if (!res.ok) throw new Error('Failed to fetch core catalog')
    const json = await res.json()
    if (json.success && json.data) {
      cores.value = json.data.cores || []
      if (json.data.stats) {
        stats.value = json.data.stats
      }
    }
  } catch (err: any) {
    console.error('fetchCores error:', err)
  } finally {
    isLoading.value = false
  }
}

async function toggleActive(core: CoreConfig) {
  if (togglingIds.value.includes(core.id)) return
  togglingIds.value.push(core.id)

  const targetState = !core.is_active

  try {
    const res = await fetchWithAuth(`/api/admin/cores/${core.id}/toggle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: targetState })
    })

    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to toggle core state')
    }

    // Update local state
    core.is_active = targetState
    showToast(`Core "${core.name}" is now ${targetState ? 'ENABLED in drop pool' : 'DISABLED'}.`)
    
    // Recalculate stats
    stats.value.activeCores = cores.value.filter(c => c.is_active).length
    stats.value.disabledCores = cores.value.length - stats.value.activeCores
  } catch (err: any) {
    console.error('toggleActive error:', err)
    showToast(err.message || 'Error toggling core status.', 'error')
  } finally {
    togglingIds.value = togglingIds.value.filter(id => id !== core.id)
  }
}

function openEditModal(core: CoreConfig) {
  formMode.value = 'edit'
  selectedCoreId.value = core.id
  formData.value = {
    name: core.name,
    description: core.description,
    classification: core.classification || getCoreFamilyName(core.name),
    tier: core.tier || 1,
    flat_buff: core.flat_buff || 0,
    multiplier_buff: core.multiplier_buff || 1.0,
    duration: core.duration || 0,
    is_active: core.is_active
  }
  isFormModalOpen.value = true
}

function closeFormModal() {
  if (isSubmitting.value) return
  isFormModalOpen.value = false
}

async function submitForm() {
  if (isSubmitting.value) return
  isSubmitting.value = true

  try {
    const endpoint = formMode.value === 'create' ? '/api/admin/cores' : `/api/admin/cores/${selectedCoreId.value}`
    const method = formMode.value === 'create' ? 'POST' : 'PUT'

    const res = await fetchWithAuth(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })

    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to save core configuration')
    }

    closeFormModal()
    showToast(json.message || `Core ${formMode.value === 'create' ? 'created' : 'updated'} successfully!`)
    await fetchCores()
  } catch (err: any) {
    console.error('submitForm error:', err)
    showToast(err.message || 'Error saving core parameter.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

function confirmDelete(core: CoreConfig) {
  deletingCore.value = core
}

async function executeDelete() {
  if (!deletingCore.value) return
  const targetId = deletingCore.value.id
  const targetName = deletingCore.value.name

  try {
    const res = await fetchWithAuth(`/api/admin/cores/${targetId}`, {
      method: 'DELETE'
    })

    const json = await res.json()
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete core')
    }

    deletingCore.value = null
    showToast(`Core "${targetName}" has been removed from catalog.`)
    await fetchCores()
  } catch (err: any) {
    console.error('executeDelete error:', err)
    showToast(err.message || 'Failed to delete core.', 'error')
  }
}

function showToast(msg: string, _type: 'success' | 'error' = 'success') {
  toastMessage.value = msg
  setTimeout(() => { toastMessage.value = '' }, 4000)
}

function getTierBadgeClass(tier: number): string {
  if (tier === 1) return 'bg-cyan-950/80 text-cyan-400 border-cyan-800/60 font-mono font-bold'
  if (tier === 2) return 'bg-purple-950/80 text-purple-400 border-purple-800/60 font-mono font-bold'
  return 'bg-amber-950/80 text-amber-400 border-amber-800/60 font-mono font-bold'
}

onMounted(() => {
  fetchCores()
})
</script>
