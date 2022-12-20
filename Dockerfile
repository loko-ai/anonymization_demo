FROM node:16.15.0 AS builder
ADD ./frontend/package.json /frontend/package.json
WORKDIR /frontend
RUN yarn install
ADD ./frontend /frontend
RUN yarn build --base="/routes/anonymization_demo/web/"

FROM python:3.7-slim
EXPOSE 8080
ADD ./requirements.txt /
RUN pip install -r /requirements.txt
COPY --from=builder /frontend/dist /frontend/dist
ARG GATEWAY
ENV GATEWAY=$GATEWAY
ADD . /plugin
ENV PYTHONPATH=$PYTHONPATH:/plugin
WORKDIR /plugin/services
CMD python services.py