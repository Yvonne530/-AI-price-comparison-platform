import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface CountryHeaderProps {
  country: {
    name: string;
    flag: string;
    currency: string;
    description: string;
  };
}

export function CountryHeader({ country }: CountryHeaderProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 relative rounded-lg overflow-hidden">
            <Image
              src={country.flag}
              alt={`${country.name}国旗`}
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{country.name}</h1>
            <p className="text-muted-foreground">
              货币：{country.currency}
            </p>
          </div>
        </div>
        <p className="text-muted-foreground">
          {country.description}
        </p>
      </CardContent>
    </Card>
  );
}