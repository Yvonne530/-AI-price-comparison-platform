import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface PageSkeletonProps {
  type?: 'list' | 'detail' | 'grid';
  count?: number;
}

export function PageSkeleton({ type = 'list', count = 5 }: PageSkeletonProps) {
  const renderListSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-[60%]" />
              <Skeleton className="h-3 w-[40%]" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const renderDetailSkeleton = () => (
    <div className="space-y-6">
      <div className="flex gap-6">
        <Skeleton className="h-[300px] w-[300px]" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
      <Card className="p-6">
        <Skeleton className="h-[400px] w-full" />
      </Card>
    </div>
  );

  const renderGridSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="p-4">
          <div className="space-y-4">
            <Skeleton className="h-[200px] w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-6">
      {type === 'list' && renderListSkeleton()}
      {type === 'detail' && renderDetailSkeleton()}
      {type === 'grid' && renderGridSkeleton()}
    </div>
  );
}