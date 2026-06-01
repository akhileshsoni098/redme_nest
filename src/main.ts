import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);



  const port = process.env.PORT ?? 3000

app.useGlobalPipes(new ValidationPipe({
  whitelist:true,                        // Extra fields auto hatao
  forbidNonWhitelisted:true,              // Extra fields pe error do
  transform:true                         // "1" → 1, "true" → true auto convert
}))



  await app.listen(port);
  console.log(`Nest App is Running on port ${port}`)

}
void bootstrap();
