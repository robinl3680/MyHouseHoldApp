import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { take, map } from 'rxjs/operators';
import { UserModel } from './user.model';
@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {

    }
    canActivate(route: ActivatedRouteSnapshot, router: RouterStateSnapshot):
    boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
        return this.authService.user.pipe(take(1),
        map((user)=>{
            if (user instanceof UserModel) {
                const isAuth = user && user.token ? true : false;
                if (isAuth) {
                    return true;
                }
            } else {
                if (user.token) {
                    return true;
                }
            }
            return this.router.createUrlTree(['/auth']);
        }));
    }
}