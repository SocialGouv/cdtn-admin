{{ define "job.alert" }}
spec:
  backoffLimit: 1
  template:
    spec:
      containers:
        - name: update-alert
          image: harbor.fabrique.social.gouv.fr/cdtn/cdtn-admin-alert-cli:1.2.3
          resources:
            requests:
              cpu: 1500m
              memory: 2.5Gi
            limits:
              cpu: 2000m
              memory: 3Gi
          workingDir: /app
          env:
            - name: PRODUCTION
              value: 'true'
          envFrom:
            - configMapRef:
                name: alert
            - secretRef:
                name: alert
          volumeMounts:
            - name: tz-paris
              mountPath: /etc/localtime
      volumes:
        - name: tz-paris
          hostPath:
            path: /usr/share/zoneinfo/Europe/Paris
      restartPolicy: Never
{{end}}
