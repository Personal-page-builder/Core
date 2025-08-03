<template>
  <div class="analytics-page">
    <div class="container mx-auto px-4 py-8">
      <!-- Заголовок -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {{ $t('admin.analytics.title') }}
        </h1>
        <p class="text-gray-600 dark:text-gray-400 mt-2">
          {{ $t('admin.analytics.description') }}
        </p>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="flex justify-center py-8">
        <div class="flex items-center gap-2">
          <UIcon name="i-lucide-loader-2" class="w-6 h-6 animate-spin" />
          <span>{{ $t('admin.analytics.loading') }}</span>
        </div>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="text-center py-8">
        <p class="text-red-600 dark:text-red-400">{{ error }}</p>
        <UButton
          color="primary"
          variant="soft"
          class="mt-4"
          @click="loadStats"
        >
          {{ $t('admin.analytics.retry') }}
        </UButton>
      </div>

      <!-- Статистика -->
      <div v-else-if="stats" class="space-y-8">
        <!-- Общая статистика -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.analytics.generalStats.title') }}</h3>
          </template>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div class="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {{ stats.uniqueVisitors.uniqueIPs }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('admin.analytics.generalStats.uniqueVisitors') }}
              </div>
            </div>
            <div class="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div class="text-2xl font-bold text-green-600 dark:text-green-400">
                {{ stats.uniqueVisitors.totalActions }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('admin.analytics.generalStats.totalActions') }}
              </div>
            </div>
            <div class="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div class="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {{ stats.actionStats.length }}
              </div>
              <div class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('admin.analytics.generalStats.actionTypes') }}
              </div>
            </div>
          </div>
        </UCard>

        <!-- Детальная статистика посещаемости -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.analytics.detailedVisits.title') }}</h3>
          </template>
          <div class="space-y-4">
            <!-- Период анализа -->
            <div class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div>
                <div class="font-medium">{{ $t('admin.analytics.detailedVisits.period') }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('admin.analytics.detailedVisits.periodDescription') }}
                </div>
              </div>
              <div class="text-right">
                <div class="font-medium">{{ stats.dailyVisits.length }} {{ $t('admin.analytics.detailedVisits.daysWithData') }}</div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  с данными
                </div>
              </div>
            </div>

            <!-- Средние показатели -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {{ averageDailyVisits }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('admin.analytics.detailedVisits.averageDaily') }}
                </div>
              </div>
              <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <div class="text-lg font-bold text-green-600 dark:text-green-400">
                  {{ maxDailyVisits }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('admin.analytics.detailedVisits.maxDaily') }}
                </div>
              </div>
              <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div class="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {{ totalVisits }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('admin.analytics.detailedVisits.totalVisits') }}
                </div>
              </div>
            </div>

            <!-- Топ дней по посещаемости -->
            <div v-if="topVisitingDays.length > 0">
              <h4 class="font-medium mb-3">{{ $t('admin.analytics.detailedVisits.topDays') }}</h4>
              <div class="space-y-2">
                <div
                  v-for="(day, index) in topVisitingDays"
                  :key="day.date"
                  class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div class="flex items-center gap-3">
                    <div class="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400">
                      {{ index + 1 }}
                    </div>
                    <div>
                      <div class="font-medium">{{ formatDate(day.date) }}</div>
                      <div class="text-sm text-gray-600 dark:text-gray-400">
                        {{ getDayOfWeek(day.date) }}
                      </div>
                    </div>
                  </div>
                  <span class="text-blue-600 dark:text-blue-400 font-bold">
                    {{ day.visits }} {{ $t('admin.analytics.formatting.visits') }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- График посещаемости -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.analytics.charts.visitsTitle') }}</h3>
          </template>
          <div ref="visitsChart" class="h-64"></div>
        </UCard>

        <!-- Статистика по действиям -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.analytics.actionStats.title') }}</h3>
          </template>
          <div class="space-y-4">
            <!-- Общая статистика действий -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                <div class="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {{ pageViewsCount }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('admin.analytics.actionStats.pageViews') }}
                </div>
              </div>
              <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                <div class="text-lg font-bold text-green-600 dark:text-green-400">
                  {{ imageLoadsCount }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('admin.analytics.actionStats.imageLoads') }}
                </div>
              </div>
              <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                <div class="text-lg font-bold text-purple-600 dark:text-purple-400">
                  {{ buttonClicksCount }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('admin.analytics.actionStats.buttonClicks') }}
                </div>
              </div>
              <div class="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-center">
                <div class="text-lg font-bold text-orange-600 dark:text-orange-400">
                  {{ linkClicksCount }}
                </div>
                <div class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('admin.analytics.actionStats.linkClicks') }}
                </div>
              </div>
            </div>

            <!-- График действий -->
            <div ref="actionsChart" class="h-64"></div>
          </div>
        </UCard>

        <!-- Топ страниц -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.analytics.topLists.pages.title') }}</h3>
          </template>
          <div class="space-y-2">
            <div
              v-for="page in stats.pageViews"
              :key="page.page"
              class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span class="font-medium">{{ page.page }}</span>
              <span class="text-blue-600 dark:text-blue-400 font-bold">
                {{ page.views }} {{ $t('admin.analytics.topLists.pages.views') }}
              </span>
            </div>
          </div>
        </UCard>

        <!-- Топ изображений -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.analytics.topLists.images.title') }}</h3>
          </template>
          <div class="space-y-2">
            <div
              v-for="image in stats.imageLoads"
              :key="image.image"
              class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span class="font-medium truncate">{{ image.image }}</span>
              <span class="text-green-600 dark:text-green-400 font-bold">
                {{ image.loads }} {{ $t('admin.analytics.topLists.images.loads') }}
              </span>
            </div>
          </div>
        </UCard>

        <!-- Топ кнопок -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.analytics.topLists.buttons.title') }}</h3>
          </template>
          <div class="space-y-2">
            <div
              v-for="button in stats.buttonClicks"
              :key="button.button"
              class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <span class="font-medium">{{ button.button }}</span>
              <span class="text-purple-600 dark:text-purple-400 font-bold">
                {{ button.clicks }} {{ $t('admin.analytics.topLists.buttons.clicks') }}
              </span>
            </div>
          </div>
        </UCard>

        <!-- Топ ссылок -->
        <UCard>
          <template #header>
            <h3 class="text-lg font-semibold">{{ $t('admin.analytics.topLists.links.title') }}</h3>
          </template>
          <div class="space-y-2">
            <div
              v-for="link in stats.linkClicks"
              :key="link.link"
              class="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <div class="flex-1 min-w-0">
                <div class="font-medium truncate">{{ link.link }}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400 truncate">
                  {{ link.url }}
                </div>
              </div>
              <span class="text-orange-600 dark:text-orange-400 font-bold ml-2">
                {{ link.clicks }} {{ $t('admin.analytics.topLists.links.clicks') }}
              </span>
            </div>
          </div>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import * as d3 from 'd3'

interface Stats {
  uniqueVisitors: {
    uniqueIPs: number
    totalActions: number
  }
  actionStats: Array<{
    action: string
    count: number
  }>
  pageViews: Array<{
    page: string
    views: number
  }>
  imageLoads: Array<{
    image: string
    loads: number
  }>
  buttonClicks: Array<{
    button: string
    clicks: number
  }>
  linkClicks: Array<{
    link: string
    clicks: number
    url: string
  }>
  dailyVisits: Array<{
    date: string
    visits: number
  }>
}

const loading = ref(false)
const error = ref('')
const stats = ref<Stats | null>(null)

const visitsChart = ref<HTMLElement>()
const actionsChart = ref<HTMLElement>()

// Вычисляемые свойства для статистики
const averageDailyVisits = computed(() => {
  if (!stats.value?.dailyVisits.length) return 0
  const total = stats.value.dailyVisits.reduce((sum, day) => sum + day.visits, 0)
  return Math.round(total / stats.value.dailyVisits.length)
})

const maxDailyVisits = computed(() => {
  if (!stats.value?.dailyVisits.length) return 0
  return Math.max(...stats.value.dailyVisits.map(day => day.visits))
})

const totalVisits = computed(() => {
  if (!stats.value?.dailyVisits.length) return 0
  return stats.value.dailyVisits.reduce((sum, day) => sum + day.visits, 0)
})

const topVisitingDays = computed(() => {
  if (!stats.value?.dailyVisits.length) return []
  return [...stats.value.dailyVisits]
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5)
})

const pageViewsCount = computed(() => {
  if (!stats.value?.actionStats.length) return 0
  const pageView = stats.value.actionStats.find(stat => stat.action === 'page_view')
  return pageView?.count || 0
})

const imageLoadsCount = computed(() => {
  if (!stats.value?.actionStats.length) return 0
  const imageLoad = stats.value.actionStats.find(stat => stat.action === 'image_load')
  return imageLoad?.count || 0
})

const buttonClicksCount = computed(() => {
  if (!stats.value?.actionStats.length) return 0
  const buttonClick = stats.value.actionStats.find(stat => stat.action === 'button_click')
  return buttonClick?.count || 0
})

const linkClicksCount = computed(() => {
  if (!stats.value?.actionStats.length) return 0
  const linkClick = stats.value.actionStats.find(stat => stat.action === 'link_click')
  return linkClick?.count || 0
})

// Функции форматирования
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getDayOfWeek = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { weekday: 'long' })
}

// Загрузка статистики
const loadStats = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const response = await $fetch<{ success: boolean; data?: Stats; error?: string }>('/api/analytics/stats')
    
    // Выводим в консоль что приходит с сервера
    console.log('📊 Аналитика с сервера:', response)
    console.log('📈 Данные статистики:', response.data)
    
    if (response.success && response.data) {
      stats.value = response.data
      await nextTick()
      updateCharts()
    } else {
      error.value = response.error || 'Ошибка загрузки статистики'
    }
  } catch (err) {
    console.error('❌ Ошибка загрузки статистики:', err)
    error.value = 'Ошибка загрузки статистики'
  } finally {
    loading.value = false
  }
}

// Создание графиков
const createCharts = () => {
  if (!stats.value) return

  console.log('🎨 Создаю графики...')

  // График посещаемости
  if (visitsChart.value && stats.value.dailyVisits.length > 0) {
    console.log('📈 Создаю график посещаемости')
    createVisitsChart()
  } else {
    console.log('⚠️ Пропускаю график посещаемости:', {
      hasChart: !!visitsChart.value,
      hasData: stats.value.dailyVisits.length > 0
    })
  }

  // График действий
  if (actionsChart.value && stats.value.actionStats.length > 0) {
    console.log('📊 Создаю график действий')
    createActionsChart()
  } else {
    console.log('⚠️ Пропускаю график действий:', {
      hasChart: !!actionsChart.value,
      hasData: stats.value.actionStats.length > 0
    })
  }
}

// Функция для принудительного обновления графиков
const updateCharts = () => {
  console.log('🔄 Обновляю графики...')
  
  // Ждем следующего тика для обновления DOM
  nextTick(() => {
    setTimeout(() => {
      createCharts()
    }, 100)
  })
}

const createVisitsChart = () => {
  if (!visitsChart.value || !stats.value) {
    console.log('❌ Не удалось создать график посещаемости:', { 
      visitsChart: !!visitsChart.value, 
      stats: !!stats.value 
    })
    return
  }

  console.log('📊 Создаю график посещаемости с данными:', stats.value.dailyVisits)

  // Очищаем предыдущий график
  d3.select(visitsChart.value).selectAll('*').remove()

  const data = stats.value.dailyVisits
  if (data.length === 0) {
    console.log('⚠️ Нет данных для графика посещаемости')
    return
  }

  const margin = { top: 30, right: 30, bottom: 60, left: 60 }
  const width = visitsChart.value.clientWidth - margin.left - margin.right
  const height = 250 - margin.top - margin.bottom

  console.log('📏 Размеры графика:', { width, height, containerWidth: visitsChart.value.clientWidth })

  const svg = d3.select(visitsChart.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Форматирование дат
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
  }

  const x = d3.scaleBand()
    .domain(data.map(d => d.date))
    .range([0, width])
    .padding(0.2)

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.visits) || 0])
    .range([height, 0])
    .nice()

  // Добавляем заголовок
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .text($t('admin.analytics.charts.visitsTitle'))

  // Ось X
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(formatDate))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-45)')

  // Ось Y
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text($t('admin.analytics.charts.visitsYAxis'))

  // Столбцы с градиентом
  const gradient = svg.append('defs')
    .append('linearGradient')
    .attr('id', 'barGradient')
    .attr('gradientUnits', 'userSpaceOnUse')
    .attr('x1', '0%')
    .attr('y1', '0%')
    .attr('x2', '0%')
    .attr('y2', '100%')

  gradient.append('stop')
    .attr('offset', '0%')
    .attr('stop-color', '#3b82f6')

  gradient.append('stop')
    .attr('offset', '100%')
    .attr('stop-color', '#1d4ed8')

  // Столбцы
  svg.selectAll('rect')
    .data(data)
    .enter()
    .append('rect')
    .attr('x', d => x(d.date) || 0)
    .attr('y', d => y(d.visits))
    .attr('width', x.bandwidth())
    .attr('height', d => height - y(d.visits))
    .attr('fill', 'url(#barGradient)')
    .attr('rx', 4)
    .attr('ry', 4)
    .style('stroke', '#1e40af')
    .style('stroke-width', '1px')

  // Добавляем значения на столбцы
  svg.selectAll('text.value')
    .data(data)
    .enter()
    .append('text')
    .attr('class', 'value')
    .attr('x', d => (x(d.date) || 0) + x.bandwidth() / 2)
    .attr('y', d => y(d.visits) - 5)
    .attr('text-anchor', 'middle')
    .style('font-size', '12px')
    .style('font-weight', 'bold')
    .style('fill', '#1e40af')
    .text(d => d.visits)

  // Добавляем линию тренда
  const line = d3.line<{ date: string; visits: number }>()
    .x(d => (x(d.date) || 0) + x.bandwidth() / 2)
    .y(d => y(d.visits))

  svg.append('path')
    .datum(data)
    .attr('fill', 'none')
    .attr('stroke', '#ef4444')
    .attr('stroke-width', 2)
    .attr('d', line)
    .style('opacity', 0.7)

  // Добавляем точки на линию тренда
  svg.selectAll('circle.trend')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'trend')
    .attr('cx', d => (x(d.date) || 0) + x.bandwidth() / 2)
    .attr('cy', d => y(d.visits))
    .attr('r', 3)
    .attr('fill', '#ef4444')
    .style('stroke', '#dc2626')
    .style('stroke-width', '1px')

  console.log('✅ График посещаемости создан успешно')
}

const createActionsChart = () => {
  if (!actionsChart.value || !stats.value) {
    console.log('❌ Не удалось создать график действий:', { 
      actionsChart: !!actionsChart.value, 
      stats: !!stats.value 
    })
    return
  }

  console.log('📊 Создаю график действий с данными:', stats.value.actionStats)

  // Очищаем предыдущий график
  d3.select(actionsChart.value).selectAll('*').remove()

  const data = stats.value.actionStats
  if (data.length === 0) {
    console.log('⚠️ Нет данных для графика действий')
    return
  }

  const margin = { top: 30, right: 30, bottom: 60, left: 80 }
  const width = actionsChart.value.clientWidth - margin.left - margin.right
  const height = 250 - margin.top - margin.bottom

  console.log('📏 Размеры графика действий:', { width, height, containerWidth: actionsChart.value.clientWidth })

  const svg = d3.select(actionsChart.value)
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`)

  // Форматирование названий действий
  const formatAction = (action: string) => {
    const actionMap: Record<string, string> = {
      'page_view': $t('admin.analytics.actionStats.pageViews'),
      'image_load': $t('admin.analytics.actionStats.imageLoads'),
      'button_click': $t('admin.analytics.actionStats.buttonClicks'),
      'link_click': $t('admin.analytics.actionStats.linkClicks'),
      'api_call': 'API вызовы'
    }
    return actionMap[action] || action
  }

  const x = d3.scaleBand()
    .domain(data.map(d => d.action))
    .range([0, width])
    .padding(0.3)

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.count) || 0])
    .range([height, 0])
    .nice()

  // Добавляем заголовок
  svg.append('text')
    .attr('x', width / 2)
    .attr('y', -10)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('font-weight', 'bold')
    .text($t('admin.analytics.charts.actionsTitle'))

  // Ось X
  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickFormat(formatAction))
    .selectAll('text')
    .style('text-anchor', 'end')
    .attr('dx', '-.8em')
    .attr('dy', '.15em')
    .attr('transform', 'rotate(-45)')

  // Ось Y
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('y', 6)
    .attr('dy', '.71em')
    .style('text-anchor', 'end')
    .text($t('admin.analytics.charts.actionsYAxis'))

  // Цвета для разных типов действий
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

  // Столбцы
  data.forEach((d, i) => {
    const color = colors[i % colors.length] || '#3b82f6'

    // Столбец
    svg.append('rect')
      .attr('x', x(d.action) || 0)
      .attr('y', y(d.count))
      .attr('width', x.bandwidth())
      .attr('height', height - y(d.count))
      .attr('fill', color)
      .attr('rx', 6)
      .attr('ry', 6)
      .style('stroke', '#1f2937')
      .style('stroke-width', '1px')

    // Значение на столбце
    svg.append('text')
      .attr('x', (x(d.action) || 0) + x.bandwidth() / 2)
      .attr('y', y(d.count) - 8)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#1f2937')
      .text(d.count)
  })

  // Добавляем легенду
  const legend = svg.append('g')
    .attr('transform', `translate(${width + 10}, 0)`)

  data.forEach((d, i) => {
    const legendItem = legend.append('g')
      .attr('transform', `translate(0, ${i * 25})`)

    const color = colors[i % colors.length] || '#3b82f6'

    legendItem.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', color)
      .attr('rx', 3)

    legendItem.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .style('font-size', '11px')
      .style('fill', '#374151')
      .text(formatAction(d.action))
  })

  console.log('✅ График действий создан успешно')
}

// Загружаем статистику при монтировании
onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.analytics-page {
  min-height: 100vh;
  background-color: #f8fafc;
}

.dark .analytics-page {
  background-color: #0f172a;
}
</style>
