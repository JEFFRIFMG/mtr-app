import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { buildLegacyTheme } from 'sanity';
import { schemaTypes } from './sanity/schemas';
import { structure } from './sanity/structure';
import { apiVersion, dataset, projectId } from './sanity/env';

const mtrTheme = buildLegacyTheme({
  '--black': '#060D18',
  '--white': '#E8EDF4',

  '--brand-primary': '#00A86B',

  '--main-navigation-color': '#0F1825',
  '--main-navigation-color--inverted': '#E8EDF4',
  '--component-bg': '#0F1825',
  '--component-text-color': '#E8EDF4',

  '--default-button-color': '#1A2E45',
  '--default-button-primary-color': '#00A86B',
  '--default-button-success-color': '#00A86B',
  '--default-button-warning-color': '#D69E2E',
  '--default-button-danger-color': '#E53E3E',

  '--state-info-color': '#7EB8E8',
  '--state-success-color': '#00A86B',
  '--state-warning-color': '#D69E2E',
  '--state-danger-color': '#E53E3E',

  '--focus-color': '#00A86B',
});

export default defineConfig({
  basePath: '/studio',
  projectId,
  dataset,
  theme: mtrTheme,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({ structure }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
