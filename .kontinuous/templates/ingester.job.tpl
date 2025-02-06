{{define "job.ingester"}}
spec:
  backoffLimit: 1
  activeDeadlineSeconds: 21600 # 6 hours
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
          resources:
            requests:
              cpu: 1500m
              memory: 3Gi
            limits:
              cpu: 2500m
              memory: 3.5Gi
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
