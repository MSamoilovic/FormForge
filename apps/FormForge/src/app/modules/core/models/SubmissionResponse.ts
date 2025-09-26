import { SubmissionPayload } from './SubmissionPayload';

export interface SubmissionResponse extends SubmissionPayload {
  id: number;
  form_id: number;
  submitted_at: string;
}
