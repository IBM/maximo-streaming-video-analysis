FROM ubuntu:18.04
RUN apt-get update -y && \
    apt-get upgrade -y && \
    apt-get install curl git ffmpeg -y
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y build-essential nodejs
RUN git clone https://github.com/IBM/maximo-streaming-video-analysis
RUN cd maximo-streaming-video-analysis/backend && npm install
RUN cd maximo-streaming-video-analysis/frontend && npm install
CMD (cd maximo-streaming-video-analysis/backend && PORT=3000 npm start &>/dev/null) ; \
    cd maximo-streaming-video-analysis/frontend && npm run serve
