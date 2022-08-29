FROM node:lts-bullseye

ENV LANG C.UTF-8
ENV LANGUAGE C.UTF-8

RUN rm -rf /bin/ls                                                                        \
    # image debian:bullseye had "ls bug", we use busybox ls instead                           \
    && apt update                                                                         \
    && apt install                                                                        \
    ca-certificates openssl telnet curl wget default-mysql-client                      \
    gnupg iputils-ping vim tcpdump net-tools binutils procps tree                      \
    libssl-dev zlib1g-dev                                                              \
    tzdata locales busybox -y                                                          \
    && busybox --install                                                                  \
    && apt purge -y                                                                       \
    && apt clean all                                                                      \
    && rm -rf /var/lib/apt/lists/*                                                        \
    && rm -rf /var/cache/*.dat-old                                                        \
    && rm -rf /var/log/*.log /var/log/*/*.log                                             \
    && rm -rf /etc/localtime
# /etc/localtime will block container mount /etc/localtime from host

RUN mkdir -p /tars-web
COPY docker/entrypoint.sh /bin/entrypoint.sh
COPY . /tars-web
RUN cd /tars-web && rm -rf .git && npm install -g pm2 && npm install
RUN chmod +x /bin/entrypoint.sh
CMD ["/bin/entrypoint.sh"]
