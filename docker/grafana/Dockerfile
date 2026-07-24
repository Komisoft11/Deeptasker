FROM grafana/grafana:10.2.3

USER root
COPY init.sh /init.sh
RUN chmod +x /init.sh

USER grafana
ENTRYPOINT ["/init.sh"]
