"use client"

import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { mockEC2Data, mockRDSData } from "@/lib/mock-data"

export default function InstanceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const instanceId = params.id as string

  // Find the instance in either EC2 or RDS data
  const instance = [...mockEC2Data, ...mockRDSData].find(
    inst => (inst["Instance ID"] || inst["InstanceId"] || inst.DBInstanceIdentifier) === instanceId
  )

  if (!instance) {
    return (
      <div className="container mx-auto py-6 px-4">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Instance Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The instance with ID {instanceId} could not be found.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <Card>
        <CardHeader>
          <CardTitle>Instance Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(instance).map(([key, value]) => (
              <div key={key} className="border-b pb-2">
                <div className="text-sm font-medium text-gray-500">{key}</div>
                <div className="mt-1">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 