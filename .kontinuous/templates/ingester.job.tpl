{{define "job.ingester"}}
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
        - name: update-ingester
          image: "{{ or .Values.registry .Values.global.registry }}/{{ .Values.global.imageProject }}/{{ .Values.global.imageRepository }}/ingester:{{ .Values.global.imageTag }}"
          workingDir: /app
          env:
            - name: PRODUCTION
              value: 'true'
          envFrom:
            - configMapRef:
                name: ingester
            - secretRef:
                name: ingester
          volumeMounts:
            - name: data
              mountPath: /app/data
      volumes:
        - name: data
          emptyDir: {}
{{end}}
