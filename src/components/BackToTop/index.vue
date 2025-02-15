<template>
    <transition :name="transitionName">
        <div :style="customStyle" @click="backToTop" class="back-to-ceiling" v-show="visible">
            <svg aria-hidden="true" class="Icon Icon--backToTopArrow" height="16" style="height:16px;width:16px"
                 viewBox="0 0 17 17" width="16" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M12.036 15.59a1 1 0 0 1-.997.995H5.032a.996.996 0 0 1-.997-.996V8.584H1.03c-1.1 0-1.36-.633-.578-1.416L7.33.29a1.003 1.003 0 0 1 1.412 0l6.878 6.88c.782.78.523 1.415-.58 1.415h-3.004v7.004z"/>
            </svg>
        </div>
    </transition>
</template>

<script lang="ts">
import {Component, Prop, Vue} from 'vue-property-decorator';

@Component({
    name: 'BackToTop',
})
export default class extends Vue {
    @Prop()
    private visibilityHeight = 400;
    @Prop()
    private transitionName = 'fade';
    @Prop()
    private backPosition = 0;
    @Prop()
    private customStyle = {
        'right': '50px',
        'bottom': '50px',
        'width': '40px',
        'height': '40px',
        'border-radius': '4px',
        'line-height': '45px',
        'background': '#e7eaf1',
    };

    private visible = false;
    private isMoving = false;
    private interval?: number;

    private mounted() {
        window.addEventListener('scroll', this.handleScroll);
    }

    private beforeDestroy() {
        window.removeEventListener('scroll', this.handleScroll);
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    private handleScroll() {
        this.visible = window.pageYOffset > this.visibilityHeight;
    }

    private backToTop() {
        if (this.isMoving) {
            return;
        }
        const start = window.pageYOffset;
        let i = 0;
        this.isMoving = true;
        const interval = setInterval(() => {
            const next = Math.floor(this.easeInOutQuad(10 * i, start, -start, 500));
            if (next <= this.backPosition) {
                window.scrollTo(0, this.backPosition);
                clearInterval(interval);
                this.isMoving = false;
            } else {
                window.scrollTo(0, next);
            }
            i++;
        }, 16.7);
    }

    private easeInOutQuad(t: number, b: number, c: number, d: number) {
        const num = t /= d / 2;
        if (num < 1) {
            return (c / 2) * t * t + b;
        } else {
            return (-c / 2) * (--t * (t - 2) - 1) + b;
        }
    }
}
</script>

<style lang="scss" scoped>
    .back-to-ceiling {
        position: fixed;
        display: inline-block;
        text-align: center;
        cursor: pointer;
    }

    .back-to-ceiling:hover {
        background: #d5dbe7;
    }

    .fade-enter-active,
    .fade-leave-active {
        transition: opacity .5s;
    }

    .fade-enter,
    .fade-leave-to {
        opacity: 0
    }

    .back-to-ceiling .Icon {
        fill: #9aaabf;
        background: none;
    }
</style>
