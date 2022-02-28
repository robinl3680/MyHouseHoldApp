import { Injectable } from "@angular/core";
import { Action, Selector, State, StateContext } from "@ngxs/store";
import { catchError, take, tap } from "rxjs/operators";
import { AuthService } from "../../auth.service";
import { AutoLogin, Login, Logout, UserInfo } from "../actions/auth.action";

@State<UserInfo>({
    name: 'Auth',
    defaults: {
        email: null,
        token: null,
        isLoggedIn: false
    }
})
@Injectable()
export class AuthState {
    constructor(private authService: AuthService) {

    }
    @Selector()
    static isUserLoggedIn(state: UserInfo) {
        return state.isLoggedIn;
    }
    @Selector()
    static getUserUniqueId(state: UserInfo) {
        return state.email;
    }
    @Selector()
    static getUserToken(state: UserInfo) {
        return state.token;
    }
    @Action(Login)
    login(ctx: StateContext<UserInfo>, action: Login ) {
        return this.authService.login(action.loginData.email, action.loginData.password)
        .pipe(
            take(1),
            tap((response: {email: string, token: string}) => {
                ctx.patchState({
                    ...{
                        email: response.email,
                        token: response.token,
                        isLoggedIn: true
                    }
                })
                this.authService.handleAuthenticationNode(response);
            }),
            catchError((err) => {
                return this.authService.handleError(err, this.authService.errorSub);
            })
        )
    }
    @Action(AutoLogin)
    autoLogin(ctx: StateContext<UserInfo>, action: AutoLogin) {
        ctx.patchState({
            ...{
                email: action.loginData.email,
                token: action.loginData.token,
                isLoggedIn: true
            }
        });
    }
    @Action(Logout)
    logout(ctx: StateContext<UserInfo>, action: Logout) {
        ctx.patchState( {
            ...{
                email: null,
                token: null,
                isLoggedIn: false
            }
        });
    }
}