import { PinoHttpLoggerOptionsBuilder, PinoLoggerFactory } from '@byndyusoft/pino-logger-factory';
import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

@Module({
    imports: [
        PinoLoggerModule.forRootAsync({
            useFactory: () => ({
                pinoHttp: new PinoHttpLoggerOptionsBuilder().withLogger(new PinoLoggerFactory().create()).build(),
            }),
        }),
    ],
})
export class LoggerModule {}
