import { Skeleton } from "@mui/material";

export default function SearchUserSkeleton() {
  return (
                    <div className="flex gap-4 p-1 border-b cursor-pointer bg-white rounded-lg">
                        <div className="h-[50px]  w-[50px] rounded-full overflow-hidden ">
                        <Skeleton variant="rounded" sx={{width:"100%",height:"100%"}}/>
                        </div>
    
                        <div className="w-[80%]">
                          <div className="flex flex-col justify-between gap-1  w-full">
                            <Skeleton/>
                            <Skeleton/>
                          </div>
    
                          <div className="flex justify-between items-center"></div>
                        </div>
                      </div>
  )
}
