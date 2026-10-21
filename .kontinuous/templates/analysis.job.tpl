{{ define "job.analysis" }}
spec:
  backoffLimit: 1
  activeDeadlineSeconds: 3600 # 1 heure
  template:
    spec:
      restartPolicy: Never
      securityContext:
        fsGroup: 1000
        runAsUser: 1000
        runAsGroup: 1000
      containers:
        - name: analysis
          image: "{{ or .Values.registry .Values.global.registry }}/{{ .Values.global.imageProject }}/{{ .Values.global.imageRepository }}/analysis:{{ .Values.global.imageTag }}"
          resources:
            requests:
              cpu: 250m
              memory: 512Mi
            limits:
              cpu: 500m
              memory: 1Gi
          workingDir: /app
          env:
            - name: PRODUCTION
              value: 'true'
          envFrom:
            - configMapRef:
                name: analysis
            - secretRef:
                name: analysis
{{end}}
