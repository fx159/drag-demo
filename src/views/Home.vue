<script setup lang='ts'>
import { ref, shallowRef } from 'vue'
import CustomButton from '@/components/CustomButton.vue'

const point = ref(['t', 'l', 'r', 'b', 'lt', 'rt', 'lb', 'rb'])

const componentData = shallowRef([{
  component: CustomButton,
  props: {},
  size: 20,
  name: 'button',
  style: {
    width: '100px',
    height: '30px',
  },
}])

function generatedId() {
  return Math.floor(Math.random() * 10000000)
}

const editor = ref<HTMLElement>()

function handleDragStart(e: DragEvent) {
  e.dataTransfer!.setData('index', (e.target as any).dataset.index)
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  e.dataTransfer!.dropEffect = 'copy'
}

const selectComponent = shallowRef()
const componentList = ref<any>([])

function handleDrop(e: DragEvent) {
  e.preventDefault()
  e.stopPropagation()
  const rectInfo = editor.value!.getBoundingClientRect()

  if (e.dataTransfer?.getData('index')) {
    const select: any = componentData.value[+e.dataTransfer.getData('index')]
    select.style = {
      ...select.style,
      top: `${e.clientY - rectInfo.y - 15}px`,
      left: `${e.clientX - rectInfo.x - 15}px`,
    }
    componentList.value.push({ ...select, id: generatedId(), component: shallowRef(select.component) })
  }
}

function handleParentMouseDown(e: MouseEvent) {
  // e.preventDefault()
  e.stopPropagation()
}

function handleMouseDown(e: MouseEvent, index: number) {
  e.stopPropagation()
  const rectInfo = editor.value?.getBoundingClientRect()
  let isFirst = true
  const move = (mouseEvent: MouseEvent) => {
    if (isFirst) {
      isFirst = false
      return
    }
    componentList.value[index].style = {
      ...componentList.value[index].style,
      left: mouseEvent.clientX - rectInfo!.left > 0 ? `${mouseEvent.clientX - rectInfo!.left - e.offsetX}px` : 0,
      top: mouseEvent.clientY - rectInfo!.top > 0 ? `${mouseEvent.clientY - rectInfo!.top - e.offsetY}px` : 0,
    }
  }
  const mouseUp = () => {
    document.removeEventListener('mousemove', move)
    document.removeEventListener('mouseup', mouseUp)
  }
  document.addEventListener('mouseup', mouseUp)
  document.addEventListener('mousemove', move)
}

function getPointStyle(point: string, { width, height, top, left }: any) {
  const nWidth = +width.slice(0, width.length - 2)
  const nHeight = +height.slice(0, height.length - 2)
  const hasT = /t/.test(point)
  const hasB = /b/.test(point)
  const hasL = /l/.test(point)
  const hasR = /r/.test(point)
  let newLeft = 0
  let newTop = 0
  if (point.length === 2) {
    newLeft = hasL ? 0 : nWidth
    newTop = hasT ? 0 : nHeight
  }
  else {
    if (hasT || hasB) {
      newLeft = nWidth / 2
      newTop = hasT ? 0 : nHeight
    }
    if (hasL || hasR) {
      newLeft = hasL ? 0 : nWidth
      newTop = Math.floor(nHeight / 2)
    }
  }

  return {
    left: `${newLeft}px`,
    top: `${newTop}px`,
    marginLeft: '-4px',
    marginTop: '-4px',
  }
}

// 旋转，放大等操作
function handleShapeMouseDown(e: MouseEvent, point: string) {
  e.preventDefault()
  e.stopPropagation()
  console.log(point)

  const move = () => {

  }
}

function handleComponentClick(item: typeof componentData.value[number]) {
  selectComponent.value = item
}

function handleUnselectComponet(e: MouseEvent) {
  e.stopPropagation()
  selectComponent.value = null
}

function handleComponentRotate() {

}
</script>

<template>
  <div class="flex p-5 page">
    <div class="left px-5 flex-1 h-full border-solid border flex" @dragstart="handleDragStart">
      <div v-for="(item, index) in componentData" :key="index" class="cursor" :draggable="true" :data-index="index">
        <span class="iconfont" :class="`icon-${item.name}`" />
      </div>
    </div>
    <div
      ref="editor" class="container w-3/5 mx-20 border-solid border relative" @dragover="handleDragOver" @drop="handleDrop"
      @click="handleUnselectComponet" @mousedown="handleParentMouseDown"
    >
      <div
        v-for="(component, index) in componentList"
        :key="component.id" class="absolute"
        :style="component.style"
        @click.stop="handleComponentClick(component)" @mousedown="e => handleMouseDown(e, index)"
      >
        <div :class="[selectComponent && selectComponent.id === component.id ? 'shape-active' : 'shape']">
          <span class="iconfont icon-xiangzuoxuanzhuan" @mousedown.stop="handleComponentRotate" />
          <div
            v-for="(item, i) in point" :key="i" class="shape-point"
            :style="getPointStyle(item, component.style)" @mousedown="e => handleShapeMouseDown(e, item)"
          />
        </div>

        <component :is="component.component" style="width:100%;height:100%" />
      </div>
    </div>
    <div class="right flex-1">
      right
    </div>
  </div>
</template>

<style scoped lang="less">
.page {
  height: 100vh;
}

.left {
  ::v-deep(.van-badge__wrapper) {
    z-index: 0 !important;
    position: relative;
  }
}

.cursor {
  cursor: grab;

  &:active {
    cursor: grabbing;
  }
}

.iconfont {
  font-size: 30px;
}

.shape {
  display: none;

  &-active {
    display: block;
  }
}

.shape-point {
  position: absolute;
  background: #fff;
  border: 1px solid #59c7f9;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  z-index: 1;
}
.icon-xiangzuoxuanzhuan{
    position: absolute;
    top: -34px;
    left: 50%;
    transform: translateX(-50%);
    cursor: grab;
    color: #59c7f9;
    font-size: 20px;
    font-weight: 600;

    &:active {
        cursor: grabbing;
    }
}
</style>
