import Link from "next/link"
import { Mail, Users, ExternalLink } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-3">Bản đồ 5 Tốt</h3>
            <p className="text-sm text-muted-foreground">
              Nền tảng hỗ trợ sinh viên Trường Đại học Ngoại ngữ - ĐHQGHN theo dõi hành trình hoàn thành danh hiệu &quot;Sinh viên 5 Tốt&quot;.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-3">Liên hệ</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <a href="mailto:sinhvien5tot.ulis@gmail.com" className="hover:text-foreground transition-colors">
                  sinhvien5tot.ulis@gmail.com
                </a>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/sinhvien5tot.ulis" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Fanpage
                </a>
              </li>
              <li>
                <a 
                  href="https://www.facebook.com/groups/ulis.bando5tot" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-foreground transition-colors"
                >
                  <Users className="h-4 w-4" />
                  Cộng đồng
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold mb-3">Đường dẫn nhanh</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/criteria" className="hover:text-foreground transition-colors">
                  Tiêu chí xét chọn
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-foreground transition-colors">
                  Hoạt động
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground transition-colors">
                  Đăng ký ngay
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Bản đồ 5 Tốt - Trường Đại học Ngoại ngữ - ĐHQGHN
        </div>
      </div>
    </footer>
  )
}