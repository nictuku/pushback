FROM busybox
ADD pushback /pushback
ENV MEMLIMIT=40000000
ENTRYPOINT /pushback
