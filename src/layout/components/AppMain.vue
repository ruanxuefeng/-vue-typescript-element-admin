<template>
    <section class="app-main">
        <transition name="fade" mode="out-in">
            <keep-alive :include="cachedViews">
                <router-view :key="key"></router-view>
            </keep-alive>
        </transition>
    </section>
</template>

<script lang="ts">
    import {Component, Vue} from 'vue-property-decorator';

    @Component
    export default class AppMain extends Vue {
        get cachedViews() {
            return this.$store.state.tagsView.cachedViews;
        }

        get key() {
            return this.$route.fullPath;
        }
    }

</script>

<style lang="scss" scoped>
    .app-main {
        /* 50= navbar  50  */
        min-height: calc(100vh - 50px);
        width: 100%;
        position: relative;
        overflow: hidden;
    }

    .fixed-header+.app-main {
        padding-top: 50px;
    }

    .hasTagsView {
        .app-main {
            /* 84 = navbar + tags-view = 50 + 34 */
            min-height: calc(100vh - 84px);
        }

        .fixed-header+.app-main {
            padding-top: 84px;
        }
    }
</style>

<style lang="scss">
    // fix css style bug in open el-dialog
    .el-popup-parent--hidden {
        .fixed-header {
            padding-right: 15px;
        }
    }
</style>

