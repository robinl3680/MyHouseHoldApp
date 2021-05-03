import { HttpInterceptor, HttpRequest, HttpHandler, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { take, exhaustMap, catchError, map } from 'rxjs/operators';
import { Injectable } from '@angular/core';

@Injectable()

export class AuthInterceptor implements HttpInterceptor{
    
    constructor(private authService: AuthService) {

    }

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        return this.authService.user.pipe(
            take(1),
            exhaustMap((userData) => {
                if(!userData) {
                    return next.handle(req);
                }
                const modifiedReq = req.clone( {
                    params: new HttpParams().set('auth', userData.token)
                });
                return next.handle(modifiedReq); 
            }), catchError((errorResponse) => {
                return this.authService.handleError(errorResponse, this.authService.errorSub);
            })
        );
    }
}