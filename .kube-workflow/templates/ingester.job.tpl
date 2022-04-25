{{define "job.ingester"}}
spec:
  backoffLimit: 1
  template:
    spec:
      containers:
        - name: update-ingester
          image: "{{ or .Values.registry .Values.global.registry }}/cdtn-admin/cdtn-admin-ingester:{{ .Values.global.imageTag }}"
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
                name: ingester
            - secretRef:
                name: ingester
          volumeMounts:
            - name: data
              mountPath: /app/data
            - name: tz-paris
              mountPath: /etc/localtime
      volumes:
        - name: data
          persistentVolumeClaim:
            claimName: ingester
        - name: tz-paris
          hostPath:
            path: /usr/share/zoneinfo/Europe/Paris
      restartPolicy: Never
{{end}}
