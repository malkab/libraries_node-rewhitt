begin;

create schema rewhitt;

/**

  Workers heartbeat.

*/
create table rewhitt.worker(
  worker_id varchar(100) primary key,
  last_activity timestamp,
  status jsonb
);

/**

  AnalysisTasks.

*/
create table rewhitt.tasks(
  task_id varchar(64) primary key,
  task_type varchar(64),
  cached_status integer,
  cached_status_messages jsonb[],
  worker_id varchar(100) references rewhitt.worker(worker_id),
  creation timestamp,
  start timestamp,
  modification timestamp,
  completion timestamp,
  additional_params jsonb,
  data jsonb
);

commit;
