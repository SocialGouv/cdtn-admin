{{define "job.cleanup"}}
spec:
  template:
    spec:
      securityContext:
        fsGroup: 1000
        runAsUser: 1000
        runAsGroup: 1000
      containers:
        - name: db-cleaner
          image: ghcr.io/socialgouv/docker/psql:7.0.0
          command:
            - psql
            - '-c'
            - >
              -- Delete logged_action older than 3 monthes

              DELETE FROM audit.logged_actions WHERE action_tstamp_tx <
              NOW() - INTERVAL '3 month';


              -- Delete alerts older than 3 monthes

              DELETE FROM alerts WHERE created_at < NOW() - INTERVAL '3
              month' AND status IN ('done', 'rejected');
          envFrom:
            - secretRef:
                name: azure-pg-user
      restartPolicy: Never
{{end}}
