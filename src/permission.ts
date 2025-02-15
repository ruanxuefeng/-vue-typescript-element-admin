import Vue from 'vue';

import router from './router/index';
import NProgress from 'nprogress'; // progress bar
import {UserState} from '@/store/modules/User';
// progress bar style
import 'nprogress/nprogress.css';
// get token from cookie
import {getToken, removeToken} from '@/utils/AuthUtils';
import getPageTitle from '@/utils/GetPageTitleUtils';
import {Message} from 'element-ui';
import RouteRecordImpl from '@/router/RouteRecordImpl';

NProgress.configure({showSpinner: false}); // NProgress Configuration

const whiteList = ['/login', '/auth-redirect']; // no redirect whitelist

Vue.directive('permission', {
    update: (el, binding) => {
        if (
            !UserState.permissions.includes(binding.value) &&
            el.parentElement
        ) {
            el.remove();
        }
    }
});

router.beforeEach(async (to, from, next) => {
    // start progress bar
    NProgress.start();
    // set page title
    document.title = getPageTitle(to.meta.title);
    // determine whether the user has logged in
    const hasToken = getToken();
    if (hasToken) {
        if (to.path === '/login') {
            // if is logged in, redirect to the home page
            next({path: '/'});
            NProgress.done();
        } else {
            const isGetPermission =
                UserState.permissions && UserState.permissions.length > 0;
            if (isGetPermission) {
                next();
            } else {
                UserState.getInfo().then(menus => {
                    const permission = menus as string[];
                    UserState.generateRoutes(permission).then(routers => {
                            router.addRoutes(routers as RouteRecordImpl[]);
                            const {path} = to;
                            next({path, replace: true});
                        }
                    );
                })
                    .catch((e) => {
                        console.log(e);
                        Message.error('获取用户信息失败，返回登录页');
                        removeToken();
                        next(`/login?redirect=${to.path}`);
                        NProgress.done();
                    });
            }
        }
    } else {
        /* has no token*/
        if (whiteList.indexOf(to.path) !== -1) {
            // in the free login whitelist, go directly
            next();
        } else {
            // other pages that do not have permission to access are redirected to the login page.
            next(`/login?redirect=${to.path}`);
            NProgress.done();
        }
    }
});

router.afterEach(() => {
    // finish progress bar
    NProgress.done();
});
