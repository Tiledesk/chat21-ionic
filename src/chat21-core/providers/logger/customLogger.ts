import { LogLevel } from './../../utils/constants';
import { Injectable } from '@angular/core';
import { NGXLogger } from 'ngx-logger';
import { LoggerService } from './../abstract/logger.service';
@Injectable()
export class CustomLogger implements LoggerService {
    // Error = 0,
    // Warn = 1,
    // Info = 2,
    // Debug = 3

    //private variables
    // private logger: NGXLogger 
    private logLevel: number = LogLevel.DEBUG;
    private isLogEnabled: boolean = true;

    constructor(private logger: NGXLogger) { }

    setLoggerConfig(isLogEnabled: boolean, logLevel: string) {
        this.isLogEnabled = isLogEnabled;
        if (logLevel) {
            this.logLevel = LogLevel[logLevel.toUpperCase()];
            // console.log('LoggerService this.logLevel  ', this.logLevel)
        }
    }

    getLoggerConfig(): {isLogEnabled: boolean, logLevel: number}{
        return {isLogEnabled: this.isLogEnabled, logLevel: this.logLevel}
    }

    /** ngx-logger typings reject `...message: any[]`; use apply to forward an arbitrary arg list. */
    private forwardToNgx(
        level: 'error' | 'warn' | 'info' | 'debug' | 'log',
        message: any[]
    ): void {
        const fn = this.logger[level] as (...args: any[]) => void;
        if (message.length === 0) {
            fn.call(this.logger, '');
        } else {
            fn.apply(this.logger, message);
        }
    }

    error(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.ERROR) {
            this.forwardToNgx('error', message);
        }
    }

    warn(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.WARN) {
            this.forwardToNgx('warn', message);
        }
    }

    info(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.INFO) {
            this.forwardToNgx('info', message);
        }
    }

    debug(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.DEBUG) {
            this.forwardToNgx('debug', message);
        }
    }

    log(...message: any[]) {
        if (this.isLogEnabled && this.logLevel >= LogLevel.DEBUG) {
            this.forwardToNgx('log', message);
        }
    }

}