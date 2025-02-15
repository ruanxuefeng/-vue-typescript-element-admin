import {Action, getModule, Module, Mutation, VuexModule} from 'vuex-module-decorators';

import {getToken, removeToken, setToken} from '@/utils/AuthUtils';
import RouteRecordImpl from '@/router/RouteRecordImpl';
import store from '@/store';
import {getInfo, login, logout} from '@/views/login/api/user';
import {filterAsyncRoutes} from '@/utils/PermissionUtils';
import router, {asyncRoutes, constantRoutes, resetRouter} from '@/router';
import WebSocket from '@/websocket';

interface User {
    $id: string;
    $token: string | undefined;
    $name: string;
    $email: string;
    $gender: string;
    $avatar: string;
    $roles: string[];
    $permissions: string[];
    $routers: RouteRecordImpl[];
}

@Module({dynamic: true, store, name: 'user'})
export default class UserImpl extends VuexModule implements User {
    public $id = '';
    public $token: string | undefined = getToken();
    public $name = '';
    public $email = '';
    public $gender = '';
    public $avatar = '';
    public $roles: string[] = [];
    public $permissions: string[] = [];
    public $routers: RouteRecordImpl[] = [];

    @Action
    public async login(userInfo: any) {
        const {username, password} = userInfo;
        const {data} = await login({username, password});
        this.setToken(data.token);
        setToken(data.token);
    }

    @Action
    public getInfo() {
        return new Promise((resolve, reject) => {
            getInfo().then((response) => {
                const data = response.data;
                const {id, name, email, gender, avatar, roles, permissions} = data;
                this.setId(id);
                this.setName(name);
                this.setEmail(email);
                this.setGender(gender);
                this.setAvatar(avatar);
                this.setRoles(roles);
                this.setPermissions(permissions);
                WebSocket.start();
                resolve(this.permissions);
            }).catch((error) => {
                reject(error);
            });
        });
    }

    @Action
    public logout() {
        return new Promise((resolve) => {
            logout().then(() => {
                this.setToken(undefined);
                removeToken();
                resetRouter();
                this.setPermissions([]);
                WebSocket.stop();
                resolve();
            });
        });
    }

    @Action
    public generateRoutes(menus: string[]) {
        return new Promise((resolve) => {
            const accessedRoutes = filterAsyncRoutes(asyncRoutes, menus);
            this.setRoutes(accessedRoutes);
            resolve(accessedRoutes);
        });
    }

    @Action
    public resetRouter() {
        this.getInfo().then((menus) => {
            resetRouter();
            this.generateRoutes((menus as string[])).then((routers) => {
                router.addRoutes((routers as RouteRecordImpl[]));
            });
        });
    }

    get id(): string {
        return this.$id;
    }

    get token(): string | undefined {
        return this.$token;
    }

    get name(): string {
        return this.$name;
    }

    get email(): string {
        return this.$email;
    }

    get gender(): string {
        return this.$gender;
    }

    get avatar(): string {
        return this.$avatar;
    }

    get roles(): string[] {
        return this.$roles;
    }

    get permissions(): string[] {
        return this.$permissions;
    }

    get routers(): RouteRecordImpl[] {
        return this.$routers;
    }

    @Mutation
    public setId(id: string) {
        this.$id = id;
    }

    @Mutation
    private setToken(token: string | undefined) {
        this.$token = token;
    }

    @Mutation
    private setPermissions(permissions: string[]) {
        this.$permissions = permissions;
    }

    @Mutation
    private setName(name: string) {
        this.$name = name;
    }

    @Mutation
    private setEmail(email: string) {
        this.$email = email;
    }

    @Mutation
    private setGender(gender: string) {
        this.$gender = gender;
    }

    @Mutation
    private setAvatar(avatar: string) {
        this.$avatar = avatar;
    }

    @Mutation
    private setRoles(roles: string[]) {
        this.$roles = roles;
    }

    @Mutation
    private setRoutes(routes: RouteRecordImpl[]) {
        this.$routers = constantRoutes.concat(routes);
    }
}

export const UserState = getModule(UserImpl);
