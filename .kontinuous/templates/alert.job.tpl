{{ define "job.alert" }}
spec:
  backoffLimit: 1
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: update-alert
          image: "{{ or .Values.registry .Values.global.registry }}/cdtn-admin/alert:{{ .Values.global.imageTag }}"
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
{{end}}
