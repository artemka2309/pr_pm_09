// app/privacy-policy/page.js
import fs from 'fs';
import path from 'path';
import { remark } from 'remark';
import html from 'remark-html';

async function getPrivacyPolicyContent() {
    const filePath = path.join(process.cwd(), 'public', 'privacy-policy.md');
    const fileContents = fs.readFileSync(filePath, 'utf8');

    const processedContent = await remark().use(html).process(fileContents);
    return processedContent.toString();
}

export default async function PrivacyPolicyPage() {
    const content = await getPrivacyPolicyContent();

    return (
        <div className='min-h-screen container mx-auto py-3 px-3'>
            <h1 className="text-lg md:text-xl text-center font-semibold my-4">Политика конфиденциальности:</h1>
            <div dangerouslySetInnerHTML={{ __html: content }} className='space-y-2' />
        </div>
    );
}