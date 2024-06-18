{{ define "job.alert" }}
spec:
  backoffLimit: 1
  template:
    spec:
      restartPolicy: Never
      securityContext:
        fsGroup: 1000
        runAsUser: 1000
        runAsGroup: 1000
      containers:
        - name: update-alert
          image: "{{ or .Values.registry .Values.global.registry }}/{{ .Values.global.imageProject }}/{{ .Values.global.imageRepository }}/alert:{{ .Values.global.imageTag }}"
          resources:
            requests:
              cpu: 1500m
              memory: 2.5Gi
            limits:
              cpu: 2000m
              memory: 4.5Gi
          workingDir: /app
          env:
            - name: PRODUCTION
              value: 'true'
          envFrom:
            - configMapRef:
                name: alert
            - secretRef:
                name: alert
{{end}}
