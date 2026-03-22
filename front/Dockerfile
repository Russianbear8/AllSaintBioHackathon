FROM node:20.19-alpine

WORKDIR /app


COPY . .
RUN yarn install

ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL
RUN yarn build
EXPOSE 4173

CMD ["yarn", "preview", "--host", "0.0.0.0"]