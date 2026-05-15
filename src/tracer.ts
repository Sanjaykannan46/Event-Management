import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import dotenv from 'dotenv';

dotenv.config();

// Create OTLP HTTP trace exporter
const traceExporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
});

// In newer versions, you configure the SDK with all options at creation time
const sdk = new NodeSDK({
  traceExporter,
  // Add console exporter for debugging
  // spanProcessors: [
  //   new SimpleSpanProcessor(new ConsoleSpanExporter())
  // ],
  serviceName:"daddy-ems-tracer",
  instrumentations: [getNodeAutoInstrumentations()],
});

// Start the SDK with proper error handling
try {
  // Type assertion to handle the Promise return type
  sdk.start()
  console.log("SDK started")
} catch (err) {
  console.error("Error starting OpenTelemetry SDK", err);
}

// Make sure to shut down the SDK when your application is terminating
process.on('SIGTERM', () => {
  sdk.shutdown()
    .then(() => console.log('SDK shut down successfully'))
    .catch(err => console.error('Error shutting down SDK', err))
    .finally(() => process.exit(0));
});