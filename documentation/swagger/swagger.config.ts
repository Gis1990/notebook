import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = () => {
  return new DocumentBuilder()
    .setTitle('Notebook API')
    .setDescription('The Notebook API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
};

export const swaggerOptions = (url: string) => {
  return {
    explorer: true,
    showExtensions: true,
    swaggerOptions: {
      urls: [
        {
          url: `${url}/swagger-json`,
          name: 'Notebook API',
        },
      ],
    },
  };
};
