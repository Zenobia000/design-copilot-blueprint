/**
 * React Query hook for `layered_triz_solutions` rows.
 *
 * Backend `/triz/solve-layered` now upserts each LTS straight into Supabase
 * (see backend/app/agents/triz_solver.py::_persist_layered_solution). The UI
 * reads the full set on mount so that page reload / tab switch no longer
 * drops in-memory state.
 *
 * Row structure mirrors migration 010 (supabase/migrations/010_triz_layered_drilldown.sql).
 * DB columns are already snake_case JSONB, matching the Pydantic schema, so
 * this mapper is almost a pass-through — it only reshapes the top-level row
 * into the `LayeredTrizSolution` TS type.
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { queryKeys, defaultQueryOptions } from '@/hooks/api/useQueryConfig';
import type {
  LayeredTrizSolution,
  L1Surface,
  L2RootCause,
  L3StructuralCheck,
  DifferentialAnalysis,
  PhaseBDirective,
  TrizSeverity,
} from '@/types/layeredTriz';

interface LayeredTrizSolutionRow {
  id: string;
  project_id: string;
  contradiction_id: string;
  contradiction_natural_description: string | null;
  severity: string;
  l1_surface: unknown;
  l2_root_cause: unknown | null;
  l3_structural_check: unknown;
  differential_analysis: unknown;
  phase_b_directive: unknown;
}

const mapRow = (r: LayeredTrizSolutionRow): LayeredTrizSolution => ({
  id: r.id,
  project_id: r.project_id,
  contradiction_id: r.contradiction_id,
  contradiction_natural_description: r.contradiction_natural_description ?? '',
  severity: (['fatal', 'major', 'minor', 'unknown'].includes(r.severity)
    ? r.severity
    : 'unknown') as TrizSeverity,
  l1_surface: r.l1_surface as L1Surface,
  l2_root_cause: (r.l2_root_cause ?? null) as L2RootCause | null,
  l3_structural_check: r.l3_structural_check as L3StructuralCheck,
  differential_analysis: r.differential_analysis as DifferentialAnalysis,
  phase_b_directive: r.phase_b_directive as PhaseBDirective,
});

export function useLayeredTrizSolutions(projectId: string | undefined) {
  return useQuery<Record<string, LayeredTrizSolution>, Error>({
    queryKey: queryKeys.layered_triz_solutions.byProject(projectId),
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- table added in migration 010, Supabase types not regenerated yet
      const { data, error } = await (supabase as any)
        .from('layered_triz_solutions')
        .select('*')
        .eq('project_id', projectId!)
        .order('created_at', { ascending: true });
      if (error) throw error;
      const byContradiction: Record<string, LayeredTrizSolution> = {};
      for (const row of (data as LayeredTrizSolutionRow[]) ?? []) {
        byContradiction[row.contradiction_id] = mapRow(row);
      }
      return byContradiction;
    },
    enabled: !!projectId,
    ...defaultQueryOptions,
  });
}
