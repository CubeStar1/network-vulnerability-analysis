-- Drop existing tables if they exist (optional, in reverse order of dependency)
DROP TABLE IF EXISTS public.simulation_events;
DROP TABLE IF EXISTS public.simulation_metrics;
DROP TABLE IF EXISTS public.simulation_runs;

-- Create the simulation_runs table with enhanced fields
CREATE TABLE public.simulation_runs (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    status text DEFAULT 'initiated', -- e.g., initiated, running, completed, failed
    topology_used jsonb, -- Store the topology that triggered this run
    description text, -- Optional description for the run
    script_type text NOT NULL, -- Type of simulation script (basic_ping, security_test, routing_analysis)
    performance_summary jsonb -- Summary metrics for the run
);

-- Create the simulation_events table with enhanced event types
CREATE TABLE public.simulation_events (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    simulation_run_id bigint REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    event_type text NOT NULL,
    category text NOT NULL, -- General category: NETWORK, SECURITY, ROUTING, SYSTEM
    data jsonb,
    severity text DEFAULT 'info', -- info, warning, error, critical
    source_node text, -- Source node if applicable
    target_node text, -- Target node if applicable
    metadata jsonb -- Additional metadata about the event
);

-- Create metrics table for time-series data
CREATE TABLE public.simulation_metrics (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    simulation_run_id bigint REFERENCES public.simulation_runs(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    metric_type text NOT NULL, -- cpu, memory, bandwidth, latency, etc.
    node_id text NOT NULL, -- The node this metric belongs to
    value float8 NOT NULL, -- The metric value
    unit text, -- Unit of measurement
    labels jsonb -- Additional labels/tags for the metric
);

-- Create indexes for better query performance
CREATE INDEX idx_events_run_id ON public.simulation_events(simulation_run_id);
CREATE INDEX idx_events_type ON public.simulation_events(event_type);
CREATE INDEX idx_events_category ON public.simulation_events(category);
CREATE INDEX idx_metrics_run_id ON public.simulation_metrics(simulation_run_id);
CREATE INDEX idx_metrics_type_node ON public.simulation_metrics(metric_type, node_id);
CREATE INDEX idx_metrics_created_at ON public.simulation_metrics(created_at);

-- Create enum types for event categories and severities
CREATE TYPE event_category AS ENUM ('NETWORK', 'SECURITY', 'ROUTING', 'SYSTEM');
CREATE TYPE event_severity AS ENUM ('info', 'warning', 'error', 'critical');

-- Add comments for documentation
COMMENT ON TABLE public.simulation_runs IS 'Stores information about simulation runs';
COMMENT ON TABLE public.simulation_events IS 'Stores events generated during simulation runs';
COMMENT ON TABLE public.simulation_metrics IS 'Stores time-series metrics collected during simulations';
COMMENT ON COLUMN public.simulation_events.category IS 'Categorizes events for easier filtering and analysis';
COMMENT ON COLUMN public.simulation_events.severity IS 'Indicates the severity level of the event';

