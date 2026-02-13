'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Form, Input, Button, Checkbox, message, Select } from 'antd'
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons'
import { login } from '@/shared/lib/api'
import { useAuth } from '../contexts/AuthContext'

const { Option } = Select

export function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState('English')

  const handleSubmit = async (values: { email: string; password: string; rememberMe?: boolean }) => {
    setLoading(true)

    try {
      const response = await login(values.email, values.password)
      setUser(response.user)
      localStorage.setItem('token', response.access_token)

      if (values.rememberMe) {
        localStorage.setItem('rememberMe', 'true')
      }

      message.success('Login successful!')
      router.push('/')
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Login failed'
      message.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative  overflow-hidden">
      <div className="fixed inset-0 -z-10 w-full h-full">
        <Image src="/bg.png" alt="Netflix background" fill className="object-cover filter brightness-50" priority />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black" />
      </div>
      {/* Header with Logo */}
      <div className="relative z-10 w-full px-4 sm:px-8 md:px-12 lg:px-16 pt-4 sm:pt-6 pb-4">
        <Link href="/" className="inline-block relative h-8 w-24 sm:h-10 sm:w-32 z-10">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            className="object-contain"
            sizes="128px"
          />
        </Link>
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 py-8">
        <div className="w-full max-w-[450px] bg-black/30 rounded-md px-12 sm:px-16 py-12 sm:py-16 backdrop-blur-sm">
          <Form
            form={form}
            name="login"
            onFinish={handleSubmit}
            layout="vertical"
            size="large"
            className="w-full"
            requiredMark={false}
          >
            <h1 className="text-white text-3xl sm:text-4xl font-medium mb-8 text-left">
              Sign In
            </h1>

            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please enter a valid email or phone number.' },
                { type: 'email', message: 'Please enter a valid email.' }
              ]}
              className="mb-4 [&_.ant-form-item-explain-error]:text-white/80"
            >
              <Input
                placeholder="Email or phone number"
                className="h-14 bg-[#333] border-[#333] text-white placeholder:text-[#8c8c8c] hover:border-[#8c8c8c] focus:border-white [&.ant-input]:bg-[#333] [&.ant-input]:text-white [&.ant-input]:border-[#333]"
                style={{ fontSize: '16px' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Your password must contain between 4 and 60 characters.' }]}
              className="mb-6 [&_.ant-form-item-explain-error]:text-white/80"
            >
              <Input.Password
                placeholder="Password"
                iconRender={(visible) => (visible ? <EyeTwoTone className="text-[#8c8c8c]" /> : <EyeInvisibleOutlined className="text-[#8c8c8c]" />)}
                className="h-14 bg-[#333] border-[#333] text-white placeholder:text-[#8c8c8c] hover:border-[#8c8c8c] focus:border-white [&.ant-input]:bg-[#333] [&.ant-input]:text-white [&.ant-input]:border-[#333]"
                style={{ fontSize: '16px' }}
              />
            </Form.Item>

            <Form.Item className="mb-4">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                className="h-12 bg-netflix-red hover:bg-[#f40612] text-white font-medium text-base rounded"
              >
                Sign In
              </Button>
            </Form.Item>

            <div className="flex items-center justify-between mb-4">
              <Form.Item name="rememberMe" valuePropName="checked" className="mb-0">
                <Checkbox className="text-[#b3b3b3] text-sm [&_.ant-checkbox-inner]:border-[#737373] [&_.ant-checkbox-checked_.ant-checkbox-inner]:bg-netflix-red [&_.ant-checkbox-checked_.ant-checkbox-inner]:border-netflix-red">
                  Remember me
                </Checkbox>
              </Form.Item>
              <Link href="/forgot-password" className="text-[#b3b3b3] text-sm hover:underline">
                Need help?
              </Link>
            </div>

            <div className="mb-4">
              <div className="text-center text-[#737373] text-base mb-4">OR</div>
              <Button
                block
                className="h-12 bg-transparent hover:bg-white/10 text-white font-medium text-base border-none"
              >
                Use a Sign-In Code
              </Button>
            </div>

            <div className="mb-4 text-center">
              <span className="text-[#737373] text-base">New to MOVIE? </span>
              <Link href="/register" className="text-white text-base font-medium hover:underline">
                Sign up now.
              </Link>
            </div>

            <div className="text-center">
              <span className="text-[#8c8c8c] text-xs leading-4">
                This page is protected by Google reCAPTCHA to ensure you&apos;re not a bot.{' '}
              </span>
              <Link href="#" className="text-[#0071eb] text-xs hover:underline">
                Learn more.
              </Link>
            </div>
          </Form>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 w-full px-4 sm:px-8 md:px-16 lg:px-40 py-12 sm:py-16 bg-black/10 backdrop-blur-sm">
        <div className="max-w-[1100px] mx-auto">
          <div className="mb-6">
            <div className="text-[#737373] text-base mb-4">
              Questions? Call{' '}
              <a href="tel:1-844-505-2993" className="underline hover:text-white">
                1-844-505-2993
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-8">
            <Link href="/faq" className="text-[#737373] text-sm underline hover:text-white">
              FAQ
            </Link>
            <Link href="/help" className="text-[#737373] text-sm underline hover:text-white">
              Help Center
            </Link>
            <Link href="/terms" className="text-[#737373] text-sm underline hover:text-white">
              Terms of Use
            </Link>
            <Link href="/privacy" className="text-[#737373] text-sm underline hover:text-white">
              Privacy
            </Link>
            <Link href="/cookies" className="text-[#737373] text-sm underline hover:text-white">
              Cookie Preferences
            </Link>
            <Link href="/corporate" className="text-[#737373] text-sm underline hover:text-white">
              Corporate Information
            </Link>
          </div>

          <div className="w-32">
            <Select
              value={language}
              onChange={setLanguage}
              className="w-full [&_.ant-select-selector]:bg-[#000] [&_.ant-select-selector]:border-[#333] [&_.ant-select-selection-item]:text-white [&_.ant-select-arrow]:text-white"
            >
              <Option value="English">English</Option>
              <Option value="Vietnamese">Tiếng Việt</Option>
            </Select>
          </div>
        </div>
      </div>
    </div>
  )
}
