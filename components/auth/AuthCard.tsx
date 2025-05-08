import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { ArrowLeft } from "lucide-react";

interface AuthCardProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function AuthCard({
  title,
  description,
  children,
}: AuthCardProps) {
  return (
    <Card className="mx-auto w-full max-w-md overflow-hidden shadow-lg">
      <CardHeader className="pb-1">
        <div className="mb-2 flex items-center justify-between">
          <Link
            href="/"
            className="rounded-full p-1 transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div className="gap flex items-center">
            <CardTitle className="text-2xl font-bold">Inneparkert</CardTitle>
          </div>
          <div className="w-5" />
        </div>
        <CardDescription className="text-center text-gray-600">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}
