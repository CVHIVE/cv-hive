import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { jobService } from '../services/jobs';
import type { JobSearchFilters, CreateJobPayload } from '../types';

export function useSearchJobs(filters: JobSearchFilters) {
  return useQuery({
    queryKey: ['jobs', 'search', filters],
    queryFn: () => jobService.searchJobs(filters),
  });
}

export function useRecentJobs() {
  return useQuery({
    queryKey: ['jobs', 'recent'],
    queryFn: () => jobService.getRecentJobs(),
  });
}

export function usePlatformStats() {
  return useQuery({
    queryKey: ['platform', 'stats'],
    queryFn: () => jobService.getPlatformStats(),
    staleTime: 5 * 60 * 1000, // cache 5 minutes
  });
}

export function useFeaturedEmployers() {
  return useQuery({
    queryKey: ['platform', 'featured-employers'],
    queryFn: () => jobService.getFeaturedEmployers(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useJob(id: string) {
  return useQuery({
    queryKey: ['jobs', id],
    queryFn: () => jobService.getJob(id),
    enabled: !!id,
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJobPayload) => jobService.createJob(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create job');
    },
  });
}

export function usePayForJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobService.payForJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Payment successful! Job is now live.');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Payment failed');
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateJobPayload> }) =>
      jobService.updateJob(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job updated!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update job');
    },
  });
}

export function useCloseJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobService.closeJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      toast.success('Job closed');
    },
  });
}

export function useEmployerJobs() {
  return useQuery({
    queryKey: ['jobs', 'employer', 'mine'],
    queryFn: () => jobService.getEmployerJobs(),
  });
}

export function useApplyToJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, coverLetter }: { id: string; coverLetter?: string }) =>
      jobService.applyToJob(id, coverLetter),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application submitted!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to apply');
    },
  });
}

export function useJobApplications(jobId: string) {
  return useQuery({
    queryKey: ['applications', 'job', jobId],
    queryFn: () => jobService.getApplicationsForJob(jobId),
    enabled: !!jobId,
  });
}

export function useCandidateApplications() {
  return useQuery({
    queryKey: ['applications', 'mine'],
    queryFn: () => jobService.getCandidateApplications(),
  });
}

export function useSaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobService.saveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
      toast.success('Job saved!');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save job');
    },
  });
}

export function useUnsaveJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => jobService.unsaveJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedJobs'] });
      toast.success('Job removed from saved');
    },
  });
}

export function useSavedJobs() {
  return useQuery({
    queryKey: ['savedJobs'],
    queryFn: () => jobService.getSavedJobs(),
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ applicationId, status, notes }: { applicationId: string; status: string; notes?: string }) =>
      jobService.updateApplicationStatus(applicationId, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['employer-profile'] });
      toast.success('Application status updated');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });
}

export function useApplicationStatusHistory(applicationId: string) {
  return useQuery({
    queryKey: ['applications', 'history', applicationId],
    queryFn: () => jobService.getApplicationStatusHistory(applicationId),
    enabled: !!applicationId,
  });
}
