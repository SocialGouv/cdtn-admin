{{/* Labels communs (composant passé en argument) */}}
{{- define "cdtn-admin.labels" -}}
helm.sh/chart: {{ printf "%s-%s" .root.Chart.Name .root.Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
app.kubernetes.io/component: {{ .name }}
app.kubernetes.io/part-of: cdtn-admin
app.kubernetes.io/version: {{ .root.Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .root.Release.Service }}
{{- with .root.Values.global.extraLabels }}
{{ toYaml . | trim }}
{{- end }}
{{- end -}}

{{- define "cdtn-admin.selectorLabels" -}}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/instance: {{ .root.Release.Name }}
{{- end -}}

{{/* Référence image complète : <global.imageRegistry>/<image>:<tag|appVersion> */}}
{{- define "cdtn-admin.image" -}}
{{- $reg := .root.Values.global.imageRegistry | trimSuffix "/" -}}
{{- $tag := .root.Values.imageTag | default .root.Chart.AppVersion -}}
{{- if $reg -}}
{{- printf "%s/%s:%s" $reg .comp.image $tag -}}
{{- else -}}
{{- printf "%s:%s" .comp.image $tag -}}
{{- end -}}
{{- end -}}

{{/* Bloc env partagé (configMap envFrom + secrets envFrom + extraEnv) */}}
{{- define "cdtn-admin.envFrom" -}}
envFrom:
  - configMapRef:
      name: {{ .name }}
  {{- range .comp.secrets }}
  - secretRef:
      name: {{ . }}
  {{- end }}
{{- end -}}
