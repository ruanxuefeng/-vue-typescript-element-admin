<template>
    <el-scrollbar
        :vertical="false"
        @wheel.native.prevent="handleScroll"
        class="scroll-container"
        ref="scrollContainer"
    >
        <slot/>
    </el-scrollbar>
</template>

<script lang="ts">
import {Component, Vue} from 'vue-property-decorator';

const tagSpacing = 4;

@Component({
    name: 'ScrollPane',
})
export default class ScrollPane extends Vue {

    public $refs!: {
        scrollContainer: Vue | HTMLElement
    };

    get scrollWrapper() {
        return (this.$refs.scrollContainer as Vue).$refs.wrap;
    }

    private mounted() {
        (this.scrollWrapper as HTMLElement).addEventListener('scroll', this.emitScroll, true);
    }

    beforeDestroy() {
        (this.scrollWrapper as HTMLElement).removeEventListener('scroll', this.emitScroll);
    }

    private emitScroll() {
        this.$emit('scroll');
    }

    public moveToTarget(currentTag: HTMLElement) {
        const scrollContainer = this.$refs.scrollContainer as Vue;
        const container = scrollContainer.$el as HTMLElement;
        const containerWidth = container.offsetWidth;
        const scrollWrapper = scrollContainer.$refs.wrap as HTMLElement;
        const tagList = this.$parent.$refs.tag as any[];

        let firstTag = null;
        let lastTag = null;

        // find first tag and last tag
        if (tagList.length > 0) {
            firstTag = tagList[0];
            lastTag = tagList[tagList.length - 1];
        }

        if (firstTag === currentTag) {
            scrollWrapper.scrollLeft = 0;
        } else if (lastTag === currentTag) {
            scrollWrapper.scrollLeft = scrollWrapper.scrollWidth - containerWidth;
        } else {
            // find preTag and nextTag
            const currentIndex = tagList.findIndex((item) => item === currentTag);
            const prevTag = tagList[currentIndex - 1];
            const nextTag = tagList[currentIndex + 1];
            // the tag's offsetLeft after of nextTag
            const afterNextTagOffsetLeft = nextTag.$el.offsetLeft + nextTag.$el.offsetWidth + tagSpacing;
            // the tag's offsetLeft before of prevTag
            const beforePrevTagOffsetLeft = prevTag.$el.offsetLeft - tagSpacing;

            if (afterNextTagOffsetLeft > scrollWrapper.scrollLeft + containerWidth) {
                scrollWrapper.scrollLeft = afterNextTagOffsetLeft - containerWidth;
            } else if (beforePrevTagOffsetLeft < scrollWrapper.scrollLeft) {
                scrollWrapper.scrollLeft = beforePrevTagOffsetLeft;
            }
        }
    }

    private handleScroll(e: MouseWheelEvent) {
        const eventDelta = (e as any).wheelDelta || -e.deltaY * 40;
        const $scrollWrapper = (this.scrollWrapper as HTMLElement);
        $scrollWrapper.scrollLeft = $scrollWrapper.scrollLeft + eventDelta / 4;
    }
}
</script>

<style lang="scss" scoped>
    .scroll-container {
        white-space: nowrap;
        position: relative;
        overflow: hidden;
        width: 100%;

        /deep/ {
            .el-scrollbar__bar {
                bottom: 0px;
            }

            .el-scrollbar__wrap {
                height: 49px;
            }
        }
    }
</style>
