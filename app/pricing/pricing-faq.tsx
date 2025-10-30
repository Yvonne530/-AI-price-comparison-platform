import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: '如何选择合适的订阅计划？',
    answer:
      '建议您根据使用需求选择：如果是个人用户偶尔比价，可以使用免费的基础版；如果经常跨境购物需要更多功能，建议选择专业版；如果是专业买手或企业用户需要团队协作和API访问，可以选择企业版。',
  },
  {
    question: '可以随时更换订阅计划吗？',
    answer:
      '是的，您可以随时升级或降级您的订阅计划。升级后将立即生效，降级将在当前计费周期结束后生效。对于年付用户，如需降级将按比例退还剩余时间的费用。',
  },
  {
    question: '付款方式有哪些？',
    answer:
      '我们支持多种付款方式，包括信用卡、支付宝、微信支付等。企业版用户还可以选择对公转账或开具发票。',
  },
  {
    question: '是否提供退款？',
    answer:
      '我们提供14天无条件退款保证。如果您在购买后14天内对服务不满意，可以申请全额退款。14天后的退款将根据具体情况评估。',
  },
  {
    question: '专业版和企业版有什么主要区别？',
    answer:
      '主要区别在于使用场景和功能深度。专业版面向个人用户，提供全面的比价和分析功能；企业版则增加了团队协作、API访问、批量操作等适合企业使用的功能，并提供更专业的支持服务。',
  },
  {
    question: '可以添加多个用户账号吗？',
    answer:
      '基础版和专业版仅支持单个用户账号。企业版支持多个用户账号和团队协作功能，具体账号数量可以根据需求定制。',
  },
];

export function PricingFAQ() {
  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-12">常见问题</h2>
      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}